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
}
