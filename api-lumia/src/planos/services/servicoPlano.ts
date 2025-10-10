import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { PlanoMestre } from '../entities/planoMestre.entity';
import { Plano } from '../entities/plano.entity';
import { AlunoPlanos } from '../entities/alunoPlanos.entity';
import { PlanoMestreDisciplina } from '../entities/planoMestreDisciplina.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Disciplina } from '../../disciplinas/entities/disciplina.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { SprintMestre } from '../../sprints/entities/sprintMestre.entity';
import { Meta } from '../../metas/entities/meta.entity';
import { MetaMestre } from '../../metas/entities/metaMestre.entity';
import { StatusMeta } from '../../common/enums/statusMeta.enum';
import { CriarPlanoMestreDto } from '../dto/criarPlanoMestre.dto';
import { AtualizarPlanoMestreDto } from '../dto/atualizarPlanoMestre.dto';
import { CriarPlanoDto } from '../dto/criarPlano.dto';
import { AtualizarPlanoDto } from '../dto/atualizarPlano.dto';
import { AssociarAlunoPlanoDto } from '../dto/associarAlunoPlano.dto';
import { AssociarDisciplinaPlanoDto } from '../dto/associarDisciplinaPlanoDto';
import { CriarInstanciaDto } from '../dto/criarInstancia.dto';
import { StatusPlano } from '../../common/enums/statusPlano.enum';

@Injectable()
export class ServicoPlano {
  constructor(
    @InjectRepository(PlanoMestre)
    private planoMestreRepository: Repository<PlanoMestre>,
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
    @InjectRepository(AlunoPlanos)
    private alunoPlanosRepository: Repository<AlunoPlanos>,
    @InjectRepository(PlanoMestreDisciplina)
    private planoMestreDisciplinaRepository: Repository<PlanoMestreDisciplina>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(SprintMestre)
    private sprintMestreRepository: Repository<SprintMestre>,
    @InjectRepository(Meta)
    private metaRepository: Repository<Meta>,
    @InjectRepository(MetaMestre)
    private metaMestreRepository: Repository<MetaMestre>,
    private dataSource: DataSource,
  ) {}

  // ===== MÉTODOS PARA PLANO MESTRE (TEMPLATES) =====

  async criarPlanoMestre(dadosPlanoMestre: CriarPlanoMestreDto): Promise<PlanoMestre> {
    const planoMestre = this.planoMestreRepository.create({
      nome: dadosPlanoMestre.nome,
      cargo: dadosPlanoMestre.cargo,
      descricao: dadosPlanoMestre.descricao,
      duracao: dadosPlanoMestre.duracao,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.planoMestreRepository.save(planoMestre);
  }

  async listarPlanosMestre(): Promise<PlanoMestre[]> {
    return await this.planoMestreRepository.find({
      where: { ativo: true },
      order: { createdAt: 'DESC' },
    });
  }

  async buscarPlanoMestrePorId(id: number): Promise<PlanoMestre> {
    const planoMestre = await this.planoMestreRepository.findOne({
      where: { id, ativo: true },
      relations: ['sprintsMestre'],
    });

    if (!planoMestre) {
      throw new NotFoundException('Plano mestre não encontrado');
    }

    return planoMestre;
  }

  async atualizarPlanoMestre(id: number, dadosAtualizacao: AtualizarPlanoMestreDto): Promise<PlanoMestre> {
    const planoMestre = await this.buscarPlanoMestrePorId(id);

    if (dadosAtualizacao.nome) planoMestre.nome = dadosAtualizacao.nome;
    if (dadosAtualizacao.cargo) planoMestre.cargo = dadosAtualizacao.cargo;
    if (dadosAtualizacao.descricao) planoMestre.descricao = dadosAtualizacao.descricao;
    if (dadosAtualizacao.duracao) planoMestre.duracao = dadosAtualizacao.duracao;
    
    planoMestre.updatedAt = new Date();

    return await this.planoMestreRepository.save(planoMestre);
  }

  async desativarPlanoMestre(id: number): Promise<void> {
    const planoMestre = await this.buscarPlanoMestrePorId(id);
    
    planoMestre.ativo = false;
    planoMestre.updatedAt = new Date();

    await this.planoMestreRepository.save(planoMestre);
  }

  // ===== MÉTODOS PARA PLANO (INSTÂNCIAS) =====

  async criarPlano(dadosPlano: CriarPlanoDto): Promise<Plano> {
    // Validação dos dados obrigatórios
    if (!dadosPlano.planoMestreId || !dadosPlano.alunoId) {
      throw new BadRequestException('planoMestreId e alunoId são obrigatórios');
    }

    // Verifica se o plano mestre existe
    const planoMestre = await this.buscarPlanoMestrePorId(dadosPlano.planoMestreId);

    // Verifica se o aluno existe
    const aluno = await this.usuarioRepository.findOne({
      where: { id: dadosPlano.alunoId },
      relations: ['grupo'],
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    if (aluno.grupo.nome !== 'aluno') {
      throw new BadRequestException('Usuário deve ser um aluno');
    }

    // Verifica se o aluno já tem um plano ativo e cancela se necessário
    const planoExistente = await this.alunoPlanosRepository.findOne({
      where: {
        usuarioId: dadosPlano.alunoId,
        ativo: true,
      },
    });

    if (planoExistente) {
      // Cancela o plano existente
      await this.alunoPlanosRepository.update(
        { usuarioId: dadosPlano.alunoId, planoId: planoExistente.planoId },
        { 
          ativo: false,
          status: StatusPlano.CANCELADO,
          observacoes: (planoExistente.observacoes || '') + 
                      '\nPlano substituído por um novo em ' + new Date().toISOString().split('T')[0],
          updatedAt: new Date(),
        }
      );
    }

    // Verifica se já existe associação para este par usuário/plano
    const associacaoExistente = await this.alunoPlanosRepository.findOne({
      where: {
        usuarioId: dadosPlano.alunoId,
        planoId: dadosPlano.planoMestreId, // Verifica se já existe instância deste template
      },
    });

    if (associacaoExistente) {
      throw new ConflictException('Este usuário já está associado a este plano');
    }

    // Cria o plano baseado no template
    const plano = this.planoRepository.create({
      nome: planoMestre.nome,
      cargo: planoMestre.cargo,
      descricao: planoMestre.descricao || `Plano personalizado baseado em: ${planoMestre.nome}`,
      duracao: planoMestre.duracao,
      planoMestreId: planoMestre.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const planoSalvo = await this.planoRepository.save(plano);

    // Calcula data prevista de término baseada na duração do plano
    let dataPrevisaoTermino = null;
    if (planoMestre.duracao) {
      const dataBase = dadosPlano.dataInicio ? new Date(dadosPlano.dataInicio) : new Date();
      dataPrevisaoTermino = new Date(dataBase);
      dataPrevisaoTermino.setMonth(dataPrevisaoTermino.getMonth() + planoMestre.duracao);
    }

    // Cria a associação aluno-plano
    await this.alunoPlanosRepository.save({
      usuarioId: dadosPlano.alunoId,
      planoId: planoSalvo.id,
      dataInicio: dadosPlano.dataInicio ? new Date(dadosPlano.dataInicio) : new Date(),
      dataPrevisaoTermino: dadosPlano.dataConclusaoEsperada ? new Date(dadosPlano.dataConclusaoEsperada) : dataPrevisaoTermino,
      observacoes: dadosPlano.observacoes || '',
      status: StatusPlano.NAO_INICIADO,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return planoSalvo;
  }

  async listarPlanos(): Promise<Plano[]> {
    return await this.planoRepository.find({
      relations: ['planoMestre'],
      order: { createdAt: 'DESC' },
    });
  }

  async buscarPlanoPorId(id: number): Promise<Plano> {
    const plano = await this.planoRepository.findOne({
      where: { id },
      relations: ['planoMestre'],
    });

    if (!plano) {
      throw new NotFoundException('Plano não encontrado');
    }

    return plano;
  }

  async atualizarPlano(id: number, dadosAtualizacao: AtualizarPlanoDto): Promise<Plano> {
    const plano = await this.buscarPlanoPorId(id);

    if (dadosAtualizacao.dataInicio) {
      // Atualizar data de início na associação aluno-plano
      await this.alunoPlanosRepository.update(
        { planoId: id },
        { dataInicio: new Date(dadosAtualizacao.dataInicio) }
      );
    }

    plano.updatedAt = new Date();

    return await this.planoRepository.save(plano);
  }

  async alterarStatusPlano(id: number, status: StatusPlano): Promise<Plano> {
    const plano = await this.buscarPlanoPorId(id);

    // Atualiza o status na associação aluno-plano
    await this.alunoPlanosRepository.update(
      { planoId: id },
      { 
        status,
        updatedAt: new Date(),
        ...(status === StatusPlano.EM_ANDAMENTO && { dataInicio: new Date() }),
        ...(status === StatusPlano.CONCLUIDO && { dataConclusao: new Date() }),
      }
    );

    plano.updatedAt = new Date();

    return await this.planoRepository.save(plano);
  }

  // ===== MÉTODOS PARA ASSOCIAÇÃO ALUNO-PLANO =====

  async associarAlunoPlano(dadosAssociacao: AssociarAlunoPlanoDto): Promise<AlunoPlanos> {
    // Verifica se o aluno existe
    const aluno = await this.usuarioRepository.findOne({
      where: { id: dadosAssociacao.alunoId },
      relations: ['grupo'],
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    if (aluno.grupo.nome !== 'aluno') {
      throw new BadRequestException('Usuário deve ser um aluno');
    }

    // Verifica se o plano existe
    const plano = await this.buscarPlanoPorId(dadosAssociacao.planoId);

    // Verifica se já existe associação ativa
    const associacaoExistente = await this.alunoPlanosRepository.findOne({
      where: {
        usuarioId: dadosAssociacao.alunoId,
        planoId: dadosAssociacao.planoId,
      },
    });

    if (associacaoExistente) {
      throw new ConflictException('Aluno já está associado a este plano');
    }

    const associacao = this.alunoPlanosRepository.create({
      usuarioId: dadosAssociacao.alunoId,
      planoId: dadosAssociacao.planoId,
      dataInicio: dadosAssociacao.dataInicio ? new Date(dadosAssociacao.dataInicio) : new Date(),
      dataPrevisaoTermino: dadosAssociacao.dataConclusaoEsperada ? new Date(dadosAssociacao.dataConclusaoEsperada) : null,
      observacoes: dadosAssociacao.observacoes,
      status: StatusPlano.NAO_INICIADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.alunoPlanosRepository.save(associacao);
  }

  async listarPlanosDoAluno(alunoId: number): Promise<AlunoPlanos[]> {
    return await this.alunoPlanosRepository.find({
      where: { usuarioId: alunoId },
      relations: ['plano', 'plano.planoMestre'],
      order: { createdAt: 'DESC' },
    });
  }

  async removerAssociacaoAlunoPlano(alunoId: number, planoId: number): Promise<void> {
    const associacao = await this.alunoPlanosRepository.findOne({
      where: { usuarioId: alunoId, planoId },
    });

    if (!associacao) {
      throw new NotFoundException('Associação não encontrada');
    }

    await this.alunoPlanosRepository.remove(associacao);
  }

  // ===== MÉTODOS ESPECÍFICOS DO SISTEMA =====

  async buscarPlanoDoAlunoLogado(alunoId: number): Promise<AlunoPlanos> {
    const associacao = await this.alunoPlanosRepository.findOne({
      where: { 
        usuarioId: alunoId,
        ativo: true,
      },
      relations: ['plano', 'plano.planoMestre'],
    });

    if (!associacao) {
      throw new NotFoundException('Você não possui planos de estudo atribuídos');
    }

    return associacao;
  }

  async atualizarProgressoAluno(alunoId: number, planoId: number, dadosProgresso: {
    progresso?: number;
    status?: StatusPlano;
    observacoes?: string;
  }): Promise<AlunoPlanos> {
    const associacao = await this.alunoPlanosRepository.findOne({
      where: { usuarioId: alunoId, planoId },
    });

    if (!associacao) {
      throw new NotFoundException('Associação aluno-plano não encontrada');
    }

    const dadosAtualizacao: any = { updatedAt: new Date() };

    if (dadosProgresso.progresso !== undefined) {
      dadosAtualizacao.progresso = dadosProgresso.progresso;
    }

    if (dadosProgresso.status) {
      dadosAtualizacao.status = dadosProgresso.status;
      if (dadosProgresso.status === StatusPlano.CONCLUIDO && !associacao.dataConclusao) {
        dadosAtualizacao.dataConclusao = new Date();
      }
    }

    if (dadosProgresso.observacoes !== undefined) {
      dadosAtualizacao.observacoes = dadosProgresso.observacoes;
    }

    await this.alunoPlanosRepository.update(
      { usuarioId: alunoId, planoId },
      dadosAtualizacao
    );

    return await this.alunoPlanosRepository.findOne({
      where: { usuarioId: alunoId, planoId },
      relations: ['plano', 'plano.planoMestre'],
    });
  }

  // ===== MÉTODOS DE ESTATÍSTICAS =====

  async obterEstatisticasPlanos(): Promise<{
    totalPlanosMestre: number;
    totalPlanosAtivos: number;
    totalPlanosConcluidos: number;
    totalAlunosComPlanos: number;
  }> {
    const [
      totalPlanosMestre,
      totalPlanosAtivos,
      totalPlanosConcluidos,
      totalAlunosComPlanos,
    ] = await Promise.all([
      this.planoMestreRepository.count({ where: { ativo: true } }),
      this.alunoPlanosRepository.count({ where: { status: StatusPlano.EM_ANDAMENTO } }),
      this.alunoPlanosRepository.count({ where: { status: StatusPlano.CONCLUIDO } }),
      this.alunoPlanosRepository
        .createQueryBuilder('ap')
        .select('COUNT(DISTINCT ap.usuarioId)', 'count')
        .getRawOne(),
    ]);

    return {
      totalPlanosMestre,
      totalPlanosAtivos,
      totalPlanosConcluidos,
      totalAlunosComPlanos: parseInt(totalAlunosComPlanos.count),
    };
  }

  // ===== MÉTODOS PARA GERENCIAR DISCIPLINAS DE UM PLANO =====

  /**
   * Associa disciplinas a um plano
   */

  // ===== MÉTODOS PARA GERENCIAR DISCIPLINAS DE PLANOS MESTRE =====

  /**
   * Associa disciplinas a um plano mestre
   */
  async associarDisciplinasAoPlanoMestre(
    planoMestreId: number,
    disciplinaIds: number[],
  ): Promise<void> {
    // Verificar se o plano mestre existe
    const planoMestre = await this.planoMestreRepository.findOne({
      where: { id: planoMestreId },
    });

    if (!planoMestre) {
      throw new NotFoundException(`Plano mestre com ID ${planoMestreId} não encontrado`);
    }

    // Verificar se todas as disciplinas existem e estão ativas
    const disciplinas = await this.disciplinaRepository.find({
      where: { id: In(disciplinaIds), ativa: true },
    });

    if (disciplinas.length !== disciplinaIds.length) {
      throw new BadRequestException('Uma ou mais disciplinas não foram encontradas ou não estão ativas');
    }

    // Criar as associações
    const agora = new Date();
    const associacoes = disciplinas.map(disciplina => ({
      planoMestreId: planoMestre.id,
      disciplinaId: disciplina.id,
      createdAt: agora,
      updatedAt: agora,
    }));

    // Remover associações existentes para evitar duplicatas
    await this.planoMestreDisciplinaRepository.delete({ planoMestreId: planoMestre.id });

    // Salvar novas associações
    await this.planoMestreDisciplinaRepository.save(associacoes);
  }

  /**
   * Lista as disciplinas associadas a um plano mestre
   */
  async listarDisciplinasDoPlanoMestre(planoMestreId: number): Promise<Disciplina[]> {
    // Verificar se o plano mestre existe
    const planoMestre = await this.planoMestreRepository.findOne({
      where: { id: planoMestreId },
    });

    if (!planoMestre) {
      throw new NotFoundException(`Plano mestre com ID ${planoMestreId} não encontrado`);
    }

    // Buscar as associações com disciplinas
    const associacoes = await this.planoMestreDisciplinaRepository.find({
      where: { planoMestreId },
      relations: ['disciplina'],
    });

    // Extrair as disciplinas das associações
    return associacoes.map(associacao => associacao.disciplina);
  }

  /**
   * Remove uma disciplina de um plano mestre
   */
  async removerDisciplinaDoPlanoMestre(planoMestreId: number, disciplinaId: number): Promise<void> {
    // Verificar se a associação existe
    const associacao = await this.planoMestreDisciplinaRepository.findOne({
      where: { planoMestreId, disciplinaId },
    });

    if (!associacao) {
      throw new NotFoundException(`Disciplina não está associada ao plano mestre`);
    }

    // Remover a associação
    await this.planoMestreDisciplinaRepository.remove(associacao);
  }

  // ===== MÉTODO PARA CRIAR INSTÂNCIA DE PLANO MESTRE =====

  /**
   * Cria uma instância personalizada de um plano mestre para um aluno
   * Transforma templates (mestre) em instâncias reais de estudo
   *
   * @param dados - Dados da instanciação (planoMestreId, idUsuario, etc.)
   * @returns Resultado da operação com informações do plano criado
   */
  async criarInstanciaPlano(dados: CriarInstanciaDto): Promise<any> {
    // Validação de dados obrigatórios
    if (!dados.planoMestreId || !dados.idUsuario) {
      throw new BadRequestException('planoMestreId e idUsuario são obrigatórios');
    }

    // Buscar o plano mestre com sua estrutura completa
    const planoMestre = await this.planoMestreRepository.findOne({
      where: { id: dados.planoMestreId, ativo: true },
      relations: ['sprintsMestre', 'sprintsMestre.metasMestre']
    });

    if (!planoMestre) {
      throw new NotFoundException('Plano mestre não encontrado ou inativo');
    }

    // Validação adicional: plano mestre deve ter sprints
    if (!planoMestre.sprintsMestre || planoMestre.sprintsMestre.length === 0) {
      throw new BadRequestException('Plano mestre deve ter pelo menos uma sprint');
    }

    // Iniciar transação para garantir atomicidade
    return await this.dataSource.transaction(async (manager) => {
      // 1. Criar o plano personalizado baseado no mestre
      const novoPlano = await manager.save(Plano, {
        nome: planoMestre.nome,
        cargo: planoMestre.cargo,
        descricao: planoMestre.descricao || `Instância de: ${planoMestre.nome}`,
        duracao: planoMestre.duracao,
        planoMestreId: planoMestre.id,  // FK para template
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 2. Criar as sprints baseadas nos templates
      let dataInicioAtual = new Date(dados.dataInicio || new Date());
      const sprintsCriadas = [];

      for (const sprintMestre of planoMestre.sprintsMestre.sort((a, b) => a.posicao - b.posicao)) {
        console.log(`Criando sprint: ${sprintMestre.nome}`);

        // Calcular duração da sprint (7 dias padrão ou baseado nas datas do template)
        const duracaoDias = sprintMestre.dataInicio && sprintMestre.dataFim
          ? Math.ceil((new Date(sprintMestre.dataFim).getTime() - new Date(sprintMestre.dataInicio).getTime()) / (1000 * 60 * 60 * 24))
          : 7;

        const dataFimAtual = new Date(dataInicioAtual);
        dataFimAtual.setDate(dataFimAtual.getDate() + duracaoDias);

        const novaSprint = await manager.save(Sprint, {
          nome: sprintMestre.nome,
          dataInicio: dataInicioAtual,
          dataFim: dataFimAtual,
          posicao: sprintMestre.posicao,
          status: StatusMeta.PENDENTE,
          planoId: novoPlano.id,           // FK para plano instância
          sprintMestreId: sprintMestre.id, // FK para template
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // 3. Criar as metas baseadas nos templates
        const metasCriadas = [];
        for (const metaMestre of sprintMestre.metasMestre.sort((a, b) => a.posicao - b.posicao)) {
          console.log(`Criando meta: ${metaMestre.assunto}`);

          await manager.save(Meta, {
            disciplina: metaMestre.disciplina,
            disciplinaId: metaMestre.disciplinaId,  // FK adicionada recentemente
            assunto: metaMestre.assunto,
            assuntoId: metaMestre.assuntoId,        // FK adicionada recentemente
            tipo: metaMestre.tipo,
            comandos: metaMestre.comandos,
            link: metaMestre.link,
            relevancia: metaMestre.relevancia,
            posicao: metaMestre.posicao,
            status: StatusMeta.PENDENTE,
            tempoEstudado: '00:00',
            desempenho: 0,
            totalQuestoes: 0,
            questoesCorretas: 0,
            sprintId: novaSprint.id,           // FK para sprint instância
            metaMestreId: metaMestre.id,       // FK para template
            createdAt: new Date(),
            updatedAt: new Date()
          });

          metasCriadas.push({
            disciplina: metaMestre.disciplina,
            assunto: metaMestre.assunto,
            tipo: metaMestre.tipo,
            templateOrigemId: metaMestre.id
          });
        }

        sprintsCriadas.push({
          id: novaSprint.id,
          nome: novaSprint.nome,
          posicao: novaSprint.posicao,
          templateOrigemId: sprintMestre.id,
          totalMetas: metasCriadas.length,
          metas: metasCriadas
        });

        // Próxima sprint começa no dia seguinte
        dataInicioAtual = new Date(dataFimAtual);
        dataInicioAtual.setDate(dataInicioAtual.getDate() + 1);
      }

      // 4. Criar associação aluno-plano
      // Converter string para enum StatusPlano
      let statusPlano: StatusPlano;
      if (dados.status) {
        switch (dados.status) {
          case 'não iniciado':
            statusPlano = StatusPlano.NAO_INICIADO;
            break;
          case 'em andamento':
            statusPlano = StatusPlano.EM_ANDAMENTO;
            break;
          case 'concluído':
            statusPlano = StatusPlano.CONCLUIDO;
            break;
          case 'cancelado':
            statusPlano = StatusPlano.CANCELADO;
            break;
          default:
            statusPlano = StatusPlano.NAO_INICIADO;
        }
      } else {
        statusPlano = StatusPlano.NAO_INICIADO;
      }

      const alunoPlano = manager.create(AlunoPlanos, {
        usuarioId: dados.idUsuario,    // Usar o nome do campo da entidade
        planoId: novoPlano.id,
        dataInicio: new Date(dados.dataInicio || new Date()),
        dataPrevisaoTermino: null, // Calcular baseado na duração do plano
        progresso: 0,
        status: statusPlano,
        observacoes: dados.observacoes || `Plano instanciado do template: ${planoMestre.nome}`,
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await manager.save(AlunoPlanos, alunoPlano);

      return {
        message: 'Instanciação completa realizada com sucesso',
        plano: {
          id: novoPlano.id,
          nome: novoPlano.nome,
          templateOrigemId: planoMestre.id,
          totalSprints: sprintsCriadas.length,
          totalMetas: sprintsCriadas.reduce((total, sprint) => total + sprint.totalMetas, 0)
        },
        sprints: sprintsCriadas,
        aluno: {
          id: dados.idUsuario,
          status: statusPlano,
          ativo: true
        }
      };
    });
  }
}
