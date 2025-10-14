import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sprint } from '../entities/sprint.entity';
import { Meta } from '../../metas/entities/meta.entity';
import { Plano } from '../../planos/entities/plano.entity';
import { AlunoPlanos } from '../../planos/entities/alunoPlanos.entity';
import { SprintAtual } from '../../sprint-atual/entities/sprintAtual.entity';
import { HistoricoSprintsResumoDto } from '../dto/historicoSprintsResumo.dto';
import { SprintAtualResumoDto } from '../dto/sprintAtualResumo.dto';
import { SprintPendenteResumoDto } from '../dto/sprintPendenteResumo.dto';
import { SprintFinalizadaResumoDto } from '../dto/sprintFinalizadaResumo.dto';
import { DetalhesSprintResponseDto } from '../dto/detalhesSprintResponse.dto';
import { SprintDetalhesResumoDto } from '../dto/sprintDetalhesResumo.dto';
import { SprintDetalhesMetasDto } from '../dto/sprintDetalhesMetas.dto';
import { SprintDetalhesComplementoDto } from '../dto/sprintDetalhesComplemento.dto';
import { MetaDisciplinaDto } from '../dto/metaDisciplina.dto';
import { StatusMeta } from '../../common/enums/statusMeta.enum';

@Injectable()
export class ServicoSprintHistorico {
  constructor(
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(Meta)
    private metaRepository: Repository<Meta>,
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
    @InjectRepository(AlunoPlanos)
    private alunoPlanosRepository: Repository<AlunoPlanos>,
    @InjectRepository(SprintAtual)
    private sprintAtualRepository: Repository<SprintAtual>,
  ) {}

  /**
   * Busca o resumo completo do histórico de sprints do aluno
   * @param usuarioId ID do usuário (aluno)
   * @returns Dados organizados por sprint atual, pendentes e finalizadas
   */
  async buscarResumoHistoricoSprint(usuarioId: number): Promise<HistoricoSprintsResumoDto> {
    // Buscar plano ativo do aluno
    const alunoPlano = await this.alunoPlanosRepository.findOne({
      where: {
        usuarioId,
        ativo: true
      },
      relations: ['plano']
    });

    if (!alunoPlano) {
      throw new NotFoundException('Aluno não possui plano ativo');
    }

    // Buscar sprint atual
    const sprintAtual = await this.buscarSprintAtualResumo(usuarioId);

    // Buscar sprints pendentes
    const sprintsPendentes = await this.buscarSprintsPendentes(alunoPlano.planoId);

    // Buscar sprints finalizadas
    const sprintsFinalizadas = await this.buscarSprintsFinalizadas(alunoPlano.planoId);

    return {
      sprintAtual,
      sprintsPendentes,
      sprintsFinalizadas
    };
  }

  /**
   * Busca e calcula métricas da sprint atual do aluno
   * @param usuarioId ID do usuário (aluno)
   * @returns Resumo da sprint atual ou null se não existir
   */
  private async buscarSprintAtualResumo(usuarioId: number): Promise<SprintAtualResumoDto | null> {
    // Buscar sprint atual
    const sprintAtual = await this.sprintAtualRepository.findOne({
      where: { usuarioId },
      relations: ['sprint', 'sprint.plano']
    });

    if (!sprintAtual?.sprint) {
      return null;
    }

    const sprint = sprintAtual.sprint;

    // Buscar metas da sprint atual
    const metas = await this.metaRepository.find({
      where: { sprintId: sprint.id }
    });

    // Calcular métricas
    const totalMetas = metas.length;
    const metasConcluidas = metas.filter(meta => meta.status === StatusMeta.CONCLUIDA).length;
    const progressoSprint = totalMetas > 0 ? (metasConcluidas / totalMetas) * 100 : 0;

    return {
      nomeSprint: sprint.nome,
      cargoPlano: sprint.plano?.nome || 'N/A',
      metaPendentes: totalMetas - metasConcluidas,
      status: 'em andamento',
      progressoSprint: Math.round(progressoSprint * 100) / 100 // Arredondar para 2 casas decimais
    };
  }

  /**
   * Busca todas as sprints pendentes do plano
   * @param planoId ID do plano
   * @returns Lista de sprints pendentes (apenas nomes)
   */
  private async buscarSprintsPendentes(planoId: number): Promise<SprintPendenteResumoDto[]> {
    const sprints = await this.sprintRepository.find({
      where: {
        planoId,
        status: StatusMeta.PENDENTE
      },
      order: { posicao: 'ASC' }
    });

    return sprints.map(sprint => ({
      nomeSprint: sprint.nome
    }));
  }

  /**
   * Busca todas as sprints finalizadas do plano, ordenadas por data de conclusão desc
   * @param planoId ID do plano
   * @returns Lista de sprints finalizadas com métricas completas
   */
  private async buscarSprintsFinalizadas(planoId: number): Promise<SprintFinalizadaResumoDto[]> {
    const sprints = await this.sprintRepository.find({
      where: {
        planoId,
        status: StatusMeta.CONCLUIDA
      },
      relations: ['plano'],
      order: { updatedAt: 'DESC' } // Ordenar por data de atualização (conclusão) descendente
    });

    const resultado: SprintFinalizadaResumoDto[] = [];

    for (const sprint of sprints) {
      // Validar se todas as metas estão realmente concluídas
      const metas = await this.metaRepository.find({
        where: { sprintId: sprint.id }
      });

      const totalMetas = metas.length;
      const metasConcluidas = metas.filter(meta => meta.status === StatusMeta.CONCLUIDA).length;

      // Só incluir se todas as metas estiverem concluídas (progresso = 100%)
      if (totalMetas > 0 && metasConcluidas === totalMetas) {
        // Calcular data de conclusão
        const dataConclusao = await this.calcularDataConclusaoSprint(sprint.id);

        resultado.push({
          nomeSprint: sprint.nome,
          cargoPlano: sprint.plano?.nome || 'N/A',
          dataConclusaoSprint: dataConclusao,
          statusSprint: 'concluida',
          progressoSprint: 100.00
        });
      }
    }

    return resultado;
  }

  /**
   * Calcula a data de conclusão da sprint
   * Usa a data da sprint se existir, senão usa a data da última meta concluída
   * @param sprintId ID da sprint
   * @returns Data formatada como string
   */
  private async calcularDataConclusaoSprint(sprintId: number): Promise<string> {
    const sprint = await this.sprintRepository.findOne({
      where: { id: sprintId }
    });

    // Se a sprint tem data de conclusão, usar ela
    if (sprint?.updatedAt) {
      return sprint.updatedAt.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }

    // Senão, buscar a data da última meta concluída
    const ultimaMetaConcluida = await this.metaRepository.findOne({
      where: {
        sprintId,
        status: StatusMeta.CONCLUIDA
      },
      order: { updatedAt: 'DESC' }
    });

    if (ultimaMetaConcluida?.updatedAt) {
      return ultimaMetaConcluida.updatedAt.toISOString().split('T')[0];
    }

    // Fallback: data atual se não encontrar nada
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Busca os detalhes completos de uma sprint específica do aluno
   * @param sprintId ID da sprint
   * @param usuarioId ID do usuário (para validação de permissão)
   * @returns Dados organizados em 3 cards estruturais
   */
  async buscarDetalhesSprint(sprintId: number, usuarioId: number): Promise<DetalhesSprintResponseDto> {
    // Buscar sprint com validação de permissão
    const sprint = await this.validarAcessoSprint(sprintId, usuarioId);

    // Buscar plano da sprint
    const plano = await this.planoRepository.findOne({
      where: { id: sprint.planoId }
    });

    if (!plano) {
      throw new NotFoundException('Plano da sprint não encontrado');
    }

    // Buscar todas as metas da sprint
    const metas = await this.metaRepository.find({
      where: { sprintId },
      order: { posicao: 'ASC' }
    });

    // Calcular métricas
    const metricas = await this.calcularMetricasDetalhesSprint(sprintId, metas);

    // Preparar dados dos 3 cards
    const cardResumo: SprintDetalhesResumoDto = {
      status: this.mapearStatusSprint(sprint.status),
      nomeSprint: sprint.nome,
      cargoPlano: plano.nome,
      desempenhoSprint: metricas.desempenhoSprint,
      metaPendentes: metricas.metaPendentes,
      totalMetas: metas.length,
      totalDisciplinas: metricas.totalDisciplinas,
      ultimaAtualizacao: metricas.ultimaAtualizacao
    };

    const cardMetas: SprintDetalhesMetasDto = {
      listaMetas: metas.map(meta => ({
        idMeta: meta.id,
        nomeDisciplina: meta.disciplina || 'Disciplina não informada'
      }))
    };

    const cardComplemento: SprintDetalhesComplementoDto = {
      progressoSprint: metricas.progressoSprint,
      dataInicio: this.formatarData(sprint.dataInicio),
      dataFim: this.formatarData(sprint.dataFim),
      tempoMedioMeta: metricas.tempoMedioMeta
    };

    return {
      cardResumo,
      cardMetas,
      cardComplemento
    };
  }

  /**
   * Valida se o usuário tem acesso à sprint (pertence ao plano ativo do usuário)
   * @param sprintId ID da sprint
   * @param usuarioId ID do usuário
   * @returns Sprint validada
   */
  private async validarAcessoSprint(sprintId: number, usuarioId: number): Promise<Sprint> {
    // Buscar sprint
    const sprint = await this.sprintRepository.findOne({
      where: { id: sprintId }
    });

    if (!sprint) {
      throw new NotFoundException('Sprint não encontrada');
    }

    // Verificar se sprint pertence ao plano ativo do usuário
    const alunoPlano = await this.alunoPlanosRepository.findOne({
      where: {
        usuarioId,
        planoId: sprint.planoId,
        ativo: true
      }
    });

    if (!alunoPlano) {
      throw new NotFoundException('Usuário não tem acesso a esta sprint');
    }

    return sprint;
  }

  /**
   * Calcula todas as métricas necessárias para os detalhes da sprint
   * @param sprintId ID da sprint
   * @param metas Lista de metas da sprint
   * @returns Objeto com todas as métricas calculadas
   */
  private async calcularMetricasDetalhesSprint(sprintId: number, metas: Meta[]) {
    const totalMetas = metas.length;
    const metasConcluidas = metas.filter(meta => meta.status === StatusMeta.CONCLUIDA);
    const metaPendentes = totalMetas - metasConcluidas.length;

    // Calcular progresso
    const progressoSprint = totalMetas > 0 ? Math.round((metasConcluidas.length / totalMetas) * 100 * 100) / 100 : 0;

    // Calcular desempenho (rendimento de acertos das metas concluídas)
    const desempenhoSprint = this.calcularDesempenhoSprint(metasConcluidas);

    // Calcular total de disciplinas distintas
    const disciplinasUnicas = new Set(metas.map(meta => meta.disciplina).filter(Boolean));
    const totalDisciplinas = disciplinasUnicas.size;

    // Calcular última atualização
    const ultimaAtualizacao = await this.calcularUltimaAtualizacaoSprint(sprintId);

    // Calcular tempo médio por meta
    const tempoMedioMeta = this.calcularTempoMedioMeta(metas);

    return {
      progressoSprint,
      desempenhoSprint,
      metaPendentes,
      totalDisciplinas,
      ultimaAtualizacao,
      tempoMedioMeta
    };
  }

  /**
   * Calcula o desempenho global da sprint (rendimento de acertos)
   * @param metasConcluidas Lista de metas concluídas
   * @returns Percentual de rendimento ou null se não houver dados
   */
  private calcularDesempenhoSprint(metasConcluidas: Meta[]): number | null {
    if (metasConcluidas.length === 0) {
      return null;
    }

    let totalQuestoesCorretas = 0;
    let totalQuestoes = 0;

    for (const meta of metasConcluidas) {
      if (meta.totalQuestoes && meta.totalQuestoes > 0) {
        totalQuestoes += meta.totalQuestoes;
        totalQuestoesCorretas += meta.questoesCorretas || 0;
      }
    }

    if (totalQuestoes === 0) {
      return null;
    }

    return Math.round((totalQuestoesCorretas / totalQuestoes) * 100 * 100) / 100;
  }

  /**
   * Calcula a última atualização da sprint (data da última meta concluída)
   * @param sprintId ID da sprint
   * @returns Data formatada ou null
   */
  private async calcularUltimaAtualizacaoSprint(sprintId: number): Promise<string | null> {
    const ultimaMetaConcluida = await this.metaRepository.findOne({
      where: {
        sprintId,
        status: StatusMeta.CONCLUIDA
      },
      order: { updatedAt: 'DESC' }
    });

    return ultimaMetaConcluida?.updatedAt?.toISOString() || null;
  }

  /**
   * Calcula o tempo médio estudado por meta
   * @param metas Lista de todas as metas da sprint
   * @returns Tempo médio formatado (HH:MM) ou null
   */
  private calcularTempoMedioMeta(metas: Meta[]): string | null {
    if (metas.length === 0) {
      return null;
    }

    // Somar todos os tempos estudados (em minutos)
    let totalMinutos = 0;
    let metasComTempo = 0;

    for (const meta of metas) {
      if (meta.tempoEstudado) {
        // Converter HH:MM para minutos
        const [horas, minutos] = meta.tempoEstudado.split(':').map(Number);
        totalMinutos += (horas * 60) + minutos;
        metasComTempo++;
      }
    }

    if (metasComTempo === 0) {
      return null;
    }

    // Calcular média
    const mediaMinutos = totalMinutos / metasComTempo;
    const horas = Math.floor(mediaMinutos / 60);
    const minutos = Math.round(mediaMinutos % 60);

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  /**
   * Mapeia o status da entidade Sprint para o formato do frontend
   * @param statusSprint Status da entidade Sprint
   * @returns Status formatado para o frontend
   */
  private mapearStatusSprint(statusSprint: string): string {
    switch (statusSprint) {
      case StatusMeta.CONCLUIDA:
        return 'concluida';
      case StatusMeta.EM_ANDAMENTO:
        return 'em andamento';
      case StatusMeta.PENDENTE:
      default:
        return 'pendente';
    }
  }

  /**
   * Formata uma data (Date ou string) para o formato YYYY-MM-DD
   * Trata casos onde a data pode ser Date, string ou null
   * @param data Data a ser formatada
   * @returns Data formatada ou null
   */
  private formatarData(data: any): string | null {
    if (!data) {
      return null;
    }

    try {
      // Se já é um objeto Date
      if (data instanceof Date) {
        return data.toISOString().split('T')[0];
      }

      // Se é uma string, tenta converter
      if (typeof data === 'string') {
        // Se já está no formato YYYY-MM-DD, retorna como está
        if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
          return data;
        }

        // Se é uma string ISO, converte para Date e formata
        const dateObj = new Date(data);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString().split('T')[0];
        }
      }

      return null;
    } catch (error) {
      // Em caso de erro, retorna null
      return null;
    }
  }
}
