import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { GrupoUsuario } from '../../usuarios/entities/grupoUsuario.entity';
import { Meta } from '../../metas/entities/meta.entity';
import { AlunoPlanos } from '../../planos/entities/alunoPlanos.entity';
import { StatusMeta } from '../../common/enums/statusMeta.enum';
import { AlunosDashboardDto, AlunoDashboardDto } from '../dto/alunosDashboard.dto';

/**
 * Serviço responsável por cálculos e métricas administrativas
 * Centraliza toda a lógica de negócio relacionada ao dashboard administrativo
 */
@Injectable()
export class ServicoDashboard {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(GrupoUsuario)
    private grupoRepository: Repository<GrupoUsuario>,
    @InjectRepository(Meta)
    private metaRepository: Repository<Meta>,
    @InjectRepository(AlunoPlanos)
    private alunoPlanoRepository: Repository<AlunoPlanos>,
  ) {}

  /**
   * Conta o total de alunos ativos (todos os usuários do grupo "aluno")
   * Query simplificada - apenas usuários do grupo aluno independente de planos
   *
   * ANTERIOR (comentado para referência):
   * - Contava apenas alunos que possuem pelo menos um plano ativo
   * - Query complexa com join AlunoPlanos: .innerJoin('u.alunoPlanos', 'ap')
   *
   * @returns Número total de alunos ativos
   */
  async contarAlunosAtivos(): Promise<number> {
    // Query simplificada: conta todos os usuários do grupo "aluno"
    const resultado = await this.usuarioRepository
      .createQueryBuilder('u')
      .innerJoin('u.grupo', 'g')
      .where('g.nome = :grupo', { grupo: 'aluno' })
      .select('COUNT(DISTINCT u.id)', 'count')
      .getRawOne();

    return parseInt(resultado.count) || 0;
  }

  /**
   * Conta o total de alunos criados no mês corrente
   * Query simplificada - alunos criados no sistema no mês corrente
   *
   * ANTERIOR (comentado para referência):
   * - Contava alunos matriculados em PLANOS no mês corrente
   * - Usava AlunoPlanos.createdAt e query complexa com COUNT(DISTINCT ap.idusuario)
   *
   * @returns Número total de alunos criados no mês corrente
   */
  async contarAlunosMatriculadosMesCorrente(): Promise<number> {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);

    // Query simplificada: conta alunos criados no mês corrente
    const resultado = await this.usuarioRepository
      .createQueryBuilder('u')
      .innerJoin('u.grupo', 'g')
      .where('g.nome = :grupo', { grupo: 'aluno' })
      .andWhere('u.createdAt >= :inicioMes', { inicioMes })
      .andWhere('u.createdAt <= :fimMes', { fimMes })
      .select('COUNT(DISTINCT u.id)', 'count')
      .getRawOne();

    return parseInt(resultado.count) || 0;
  }

  /**
   * Calcula o percentual de metas concluídas no mês corrente
   * Formula: (metas concluídas no mês / total metas criadas no mês) * 100
   * @returns Percentual de metas concluídas no mês corrente (0-100)
   */
  async calcularPercentualMetasConcluidasMes(): Promise<number> {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);

    // Conta total de metas criadas no mês corrente
    const totalMetasMes = await this.metaRepository
      .createQueryBuilder('m')
      .where('m.createdAt >= :inicioMes', { inicioMes })
      .andWhere('m.createdAt <= :fimMes', { fimMes })
      .getCount();

    // Conta metas concluídas no mês corrente
    const metasConcluidasMes = await this.metaRepository
      .createQueryBuilder('m')
      .where('m.createdAt >= :inicioMes', { inicioMes })
      .andWhere('m.createdAt <= :fimMes', { fimMes })
      .andWhere('m.status = :status', { status: StatusMeta.CONCLUIDA })
      .getCount();

    // Calcula percentual
    const percentual = totalMetasMes > 0 ? (metasConcluidasMes / totalMetasMes) * 100 : 0;

    return Math.round(percentual * 100) / 100; // 2 casas decimais
  }

  /**
   * Calcula a média diária de tempo de estudo dos alunos ativos
   * Soma todo o tempo estudado no mês corrente e divide pela quantidade de dias únicos com atividade
   *
   * ANTERIOR (comentado para referência):
   * - Dividia pelo número total de dias do mês (ex: 31 dias)
   * - Fórmula: totalMinutos / diasNoMes
   *
   * ATUAL (mais fiel):
   * - Divide pela quantidade de dias únicos que tiveram metas concluídas
   * - Fórmula: totalMinutos / diasComAtividade
   * - Reflete tempo médio por dia que realmente houve estudo
   *
   * @returns Média diária em formato HH:MM
   */
  async calcularTempoEstudoDiarioMedio(): Promise<string> {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);

    // Busca alunos ativos
    const alunosAtivos = await this.usuarioRepository
      .createQueryBuilder('u')
      .innerJoin('u.grupo', 'g')
      .innerJoin('u.alunoPlanos', 'ap')
      .where('g.nome = :grupo', { grupo: 'aluno' })
      .select('u.id', 'usuarioId')
      .getRawMany();

    if (alunosAtivos.length === 0) {
      return '00:00';
    }

    const idsAlunosAtivos = alunosAtivos.map(a => a.usuarioId);

    // Busca tempo estudado das metas desses alunos no mês corrente
    const metasComTempo = await this.metaRepository
      .createQueryBuilder('m')
      .innerJoin('m.sprint', 's')
      .innerJoin('s.sprintAtual', 'sa')
      .where('sa.usuarioId IN (:...ids)', { ids: idsAlunosAtivos })
      .andWhere('m.createdAt >= :inicioMes', { inicioMes })
      .andWhere('m.createdAt <= :fimMes', { fimMes })
      .andWhere('m.tempoEstudado IS NOT NULL')
      .andWhere('m.tempoEstudado != :tempoZero', { tempoZero: '00:00' })
      .select('m.tempoEstudado', 'tempoEstudado')
      .addSelect('DATE(m.createdAt)', 'dataAtividade') // Adicionado para contar dias únicos
      .getRawMany();

    if (metasComTempo.length === 0) {
      return '00:00';
    }

    // Converte e soma todos os tempos em minutos
    let totalMinutos = 0;
    const diasComAtividade = new Set<string>();

    for (const meta of metasComTempo) {
      totalMinutos += this.converterTempoParaMinutos(meta.tempoEstudado);
      // Adiciona a data ao Set para contar dias únicos
      diasComAtividade.add(meta.dataAtividade);
    }

    // Calcula média diária baseada em dias que realmente houveram atividade
    const quantidadeDiasAtivos = diasComAtividade.size;
    const mediaMinutosDiaria = totalMinutos / quantidadeDiasAtivos;

    return this.converterMinutosParaTempo(Math.round(mediaMinutosDiaria));
  }

  /**
   * Converte tempo no formato HH:MM para minutos
   * @param tempo Tempo no formato HH:MM
   * @returns Total em minutos
   */
  private converterTempoParaMinutos(tempo: string): number {
    if (!tempo || tempo === '00:00') return 0;

    const [horas, minutos] = tempo.split(':').map(Number);
    return (horas * 60) + minutos;
  }

  /**
   * Converte minutos totais para formato HH:MM
   * @param totalMinutos Total em minutos
   * @returns Tempo no formato HH:MM
   */
  private converterMinutosParaTempo(totalMinutos: number): string {
    if (totalMinutos <= 0) return '00:00';

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  /**
   * Busca lista de alunos para o dashboard administrativo
   * Retorna dados paginados com informações completas dos alunos
   *
   * @param pagina Número da página (padrão: 1)
   * @param limite Número de registros por página (padrão: 10)
   * @returns Lista paginada de alunos com informações completas
   */
  async buscarAlunosDashboard(pagina: number = 1, limite: number = 10): Promise<AlunosDashboardDto> {
    // Calcula offset para paginação
    const offset = (pagina - 1) * limite;

    // Query principal para buscar alunos com paginação
    const query = this.usuarioRepository
      .createQueryBuilder('u')
      .innerJoin('u.grupo', 'g')
      .leftJoin('u.alunoPlanos', 'ap')  // Left join pois nem todos alunos têm planos
      .leftJoin('ap.plano', 'p')        // Left join para pegar nome do plano
      .where('g.nome = :grupo', { grupo: 'aluno' })
      .select([
        'u.id as idAluno',
        'u.nome as nomeAluno',
        'u.login as emailAluno',
        'u.cpf as cpfAluno',
        'u.situacao as situacaoUsuario',
        'u.createdAt as dataCadastro',
        'p.nome as nomePlano'
      ])
      .orderBy('u.createdAt', 'DESC')
      .offset(offset)
      .limit(limite);

    // Executa query paginada
    const alunosRaw = await query.getRawMany();

    // Query para contar total de alunos (sem paginação)
    const totalQuery = this.usuarioRepository
      .createQueryBuilder('u')
      .innerJoin('u.grupo', 'g')
      .where('g.nome = :grupo', { grupo: 'aluno' })
      .select('COUNT(u.id)', 'total');

    const totalResult = await totalQuery.getRawOne();
    const total = parseInt(totalResult.total) || 0;

    // Mapeia dados para DTO (usando nomes em minúsculo retornados pelo PostgreSQL)
    const alunos: AlunoDashboardDto[] = alunosRaw.map(aluno => ({
      idAluno: aluno.idaluno,
      nomeAluno: aluno.nomealuno,
      emailAluno: aluno.emailaluno,
      cpfAluno: aluno.cpfaluno,
      planoAtivo: aluno.nomeplano || null,
      dataCadastro: aluno.datacadastro ? aluno.datacadastro.toISOString().split('T')[0] : null,
      status: aluno.situacaousuario ? 'ativo' : 'inativo'
    }));

    // Calcula informações de paginação
    const totalPaginas = Math.ceil(total / limite);

    return {
      alunos,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas
      }
    };
  }
}


