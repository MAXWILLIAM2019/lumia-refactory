import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { NotFoundException as HttpNotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SprintAtual } from '../entities/sprintAtual.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { Plano } from '../../planos/entities/plano.entity';
import { AlunoPlanos } from '../../planos/entities/alunoPlanos.entity';
import { Meta } from '../../metas/entities/meta.entity';
import { AtualizarSprintAtualDto } from '../dto/atualizarSprintAtual.dto';
import { MetricasSprintDto } from '../dto/metricasSprint.dto';
import { DashboardSprintDto } from '../dto/dashboardSprint.dto';
import { StatusMeta } from '../../common/enums/statusMeta.enum';

@Injectable()
export class ServicoSprintAtual {
  constructor(
    @InjectRepository(SprintAtual)
    private sprintAtualRepository: Repository<SprintAtual>,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
    @InjectRepository(AlunoPlanos)
    private alunoPlanosRepository: Repository<AlunoPlanos>,
    @InjectRepository(Meta)
    private metaRepository: Repository<Meta>,
    private dataSource: DataSource,
  ) {}

  // ===== MÉTODOS PARA SPRINT ATUAL =====

  async buscarSprintAtual(usuarioId: number): Promise<any> {
    console.log('========== BUSCANDO SPRINT ATUAL ==========');
    console.log('ID do usuário:', usuarioId);

    // Primeiro, buscar o plano do usuário
    const alunoPlano = await this.alunoPlanosRepository.findOne({
      where: { usuarioId },
      relations: ['plano', 'plano.sprints', 'plano.sprints.metas'],
    });

    if (!alunoPlano || !alunoPlano.plano || !alunoPlano.plano.sprints || alunoPlano.plano.sprints.length === 0) {
      throw new NotFoundException('Usuário não possui plano de estudo com sprints');
    }

    // Ordenar as sprints por posição
    const sprintsOrdenadas = alunoPlano.plano.sprints.sort((a, b) => a.posicao - b.posicao);
    const primeiraSprint = sprintsOrdenadas[0];

    // Buscar a sprint atual do usuário
    let sprintAtual = await this.sprintAtualRepository.findOne({
      where: { usuarioId },
      relations: ['sprint', 'sprint.metas'],
    });

    // Se não existir sprint atual, criar com a primeira sprint do plano
    if (!sprintAtual) {
      sprintAtual = await this.sprintAtualRepository.save({
        usuarioId,
        sprintId: primeiraSprint.id,
        dataAtualizacao: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Buscar a sprint completa com suas metas
      const sprintCompleta = await this.sprintRepository.findOne({
        where: { id: primeiraSprint.id },
        relations: ['metas'],
      });

      return this.formatarSprintResposta(sprintCompleta);
    }

    // Se já existe sprint atual, formatar e retornar
    return this.formatarSprintResposta(sprintAtual.sprint);
  }

  async atualizarSprintAtual(usuarioId: number, dadosAtualizacao: AtualizarSprintAtualDto): Promise<any> {
    const { sprintId } = dadosAtualizacao;

    if (!sprintId) {
      throw new BadRequestException('ID da sprint é obrigatório');
    }

    // Verificar se a sprint existe
    const sprint = await this.sprintRepository.findOne({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint não encontrada');
    }

    // Verificar se a sprint pertence ao plano do usuário
    const alunoPlano = await this.alunoPlanosRepository.findOne({
      where: { 
        usuarioId,
        ativo: true 
      },
      relations: ['plano', 'plano.sprints'],
    });

    if (!alunoPlano) {
      throw new ForbiddenException('Aluno não possui plano ativo');
    }

    const sprintPertenceAoPlano = alunoPlano.plano.sprints.some(s => s.id === sprintId);

    if (!sprintPertenceAoPlano) {
      throw new ForbiddenException('Sprint não pertence ao plano do usuário');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar a sprint atual antes de atualizar
      const sprintAtualAnterior = await queryRunner.manager.findOne(SprintAtual, {
        where: { usuarioId },
        relations: ['sprint', 'sprint.metas'],
      });

      // Se existir uma sprint atual, marcar como concluída antes de mudar
      if (sprintAtualAnterior && sprintAtualAnterior.sprint) {
        const todasMetasConcluidas = sprintAtualAnterior.sprint.metas.every(
          meta => meta.status === StatusMeta.CONCLUIDA
        );

        if (todasMetasConcluidas) {
          await queryRunner.manager.update(Sprint, sprintAtualAnterior.sprint.id, {
            status: StatusMeta.CONCLUIDA,
            updatedAt: new Date(),
          });
        }
      }

      // Atualizar ou criar o registro da sprint atual
      const sprintAtualExistente = await queryRunner.manager.findOne(SprintAtual, {
        where: { usuarioId },
      });

      if (sprintAtualExistente) {
        await queryRunner.manager.update(SprintAtual, sprintAtualExistente.id, {
          sprintId: sprintId,
          dataAtualizacao: new Date(),
          updatedAt: new Date(),
        });
      } else {
        await queryRunner.manager.save(SprintAtual, {
          usuarioId,
          sprintId: sprintId,
          dataAtualizacao: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await queryRunner.commitTransaction();

      // Buscar a sprint completa com suas metas
      const sprintCompleta = await this.sprintRepository.findOne({
        where: { id: sprintId },
        relations: ['metas'],
      });

      return this.formatarSprintResposta(sprintCompleta);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async inicializarSprintAtual(usuarioId: number): Promise<any> {
    console.log('========== INICIALIZANDO SPRINT ATUAL ==========');
    console.log('ID do usuário:', usuarioId);

    // Verificar se já existe uma sprint atual
    const sprintAtualExistente = await this.sprintAtualRepository.findOne({
      where: { usuarioId },
    });

    if (sprintAtualExistente) {
      throw new BadRequestException('Usuário já possui sprint atual');
    }

    // Buscar o plano do usuário
    const alunoPlano = await this.alunoPlanosRepository.findOne({
      where: { usuarioId },
      relations: ['plano', 'plano.sprints', 'plano.sprints.metas'],
    });

    if (!alunoPlano || !alunoPlano.plano || !alunoPlano.plano.sprints || alunoPlano.plano.sprints.length === 0) {
      throw new NotFoundException('Usuário não possui plano de estudo com sprints');
    }

    // Ordenar as sprints por posição
    const sprintsOrdenadas = alunoPlano.plano.sprints.sort((a, b) => a.posicao - b.posicao);
    const primeiraSprint = sprintsOrdenadas[0];
    
    // Criar o registro da sprint atual
    const sprintAtual = await this.sprintAtualRepository.save({
      usuarioId,
      sprintId: primeiraSprint.id,
      dataAtualizacao: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Buscar a sprint completa com suas metas
    const sprintCompleta = await this.sprintRepository.findOne({
      where: { id: primeiraSprint.id },
      relations: ['metas'],
    });

    return this.formatarSprintResposta(sprintCompleta);
  }

  /**
   * Calcula métricas estatísticas da sprint atual do usuário
   * Fornece dados agregados para dashboard e relatórios de progresso
   */
  async calcularMetricasSprintAtual(usuarioId: number): Promise<MetricasSprintDto> {
    // Buscar sprint atual do usuário
    const sprintAtual = await this.buscarSprintAtual(usuarioId);

    if (!sprintAtual || !sprintAtual.metas) {
      throw new NotFoundException('Usuário não possui sprint atual com metas');
    }

    const metas = sprintAtual.metas;
    const totalMetas = metas.length;

    // Contar metas concluídas
    const metasConcluidas = metas.filter(meta => meta.status === StatusMeta.CONCLUIDA).length;

    // Calcular percentual de conclusão
    const percentualConclusao = totalMetas > 0 ? (metasConcluidas / totalMetas) * 100 : 0;

    // Calcular desempenho médio apenas das metas concluídas com desempenho válido
    const metasComDesempenho = metas.filter(meta =>
      meta.status === StatusMeta.CONCLUIDA &&
      meta.desempenho !== undefined &&
      meta.desempenho !== null &&
      !isNaN(parseFloat(meta.desempenho.toString()))
    );

    let desempenhoMedio = 0;
    if (metasComDesempenho.length > 0) {
      const somaDesempenhos = metasComDesempenho.reduce((acc, meta) =>
        acc + parseFloat(meta.desempenho.toString()), 0
      );
      desempenhoMedio = somaDesempenhos / metasComDesempenho.length;
    }

    // Calcular total de horas estudadas
    const totalMinutos = metas.reduce((acc, meta) => {
      const tempoEstudado = meta.tempoEstudado || '00:00';
      const [horas, minutos] = tempoEstudado.split(':').map(Number);
      return acc + (horas * 60) + minutos;
    }, 0);

    const horasTotais = Math.floor(totalMinutos / 60);
    const minutosTotais = totalMinutos % 60;
    const totalHorasEstudadas = `${horasTotais.toString().padStart(2, '0')}:${minutosTotais.toString().padStart(2, '0')}`;

    // Calcular média diária (desde o início da sprint)
    const dataInicio = new Date(sprintAtual.dataInicio);
    const hoje = new Date();
    const diasDecorridos = Math.max(1, Math.ceil((hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)));

    const minutosDiarios = totalMinutos / diasDecorridos;
    const horasDiarias = Math.floor(minutosDiarios / 60);
    const minutosDiariosRestantes = Math.floor(minutosDiarios % 60);
    const mediaHorasDiaria = `${horasDiarias.toString().padStart(2, '0')}:${minutosDiariosRestantes.toString().padStart(2, '0')}`;

    // Contar disciplinas únicas
    const disciplinasUnicas = new Set(metas.map(meta => meta.disciplina));
    const totalDisciplinas = disciplinasUnicas.size;

    // Calcular total de questões resolvidas
    const questoesTotaisResolvidas = metas
      .filter(meta => meta.status === StatusMeta.CONCLUIDA)
      .reduce((acc, meta) => acc + (meta.totalQuestoes || 0), 0);

    return {
      sprintId: sprintAtual.id,
      totalMetas,
      metasConcluidas,
      percentualConclusao: Math.round(percentualConclusao * 100) / 100, // 2 casas decimais
      desempenhoMedio: Math.round(desempenhoMedio * 100) / 100, // 2 casas decimais
      totalHorasEstudadas,
      questoesTotaisResolvidas,
      mediaHorasDiaria,
      totalDisciplinas,
    };
  }

  /**
   * Busca dados completos do dashboard da sprint atual
   * Retorna sprint, metas e métricas calculadas em uma única resposta
   */
  async buscarDashboardSprintAtual(usuarioId: number): Promise<DashboardSprintDto> {
    // Buscar sprint atual do usuário (registro da tabela SprintAtual)
    const sprintAtualRegistro = await this.sprintAtualRepository.findOne({
      where: { usuarioId },
      relations: ['sprint', 'sprint.metas', 'sprint.plano'],
    });

    if (!sprintAtualRegistro || !sprintAtualRegistro.sprint) {
      throw new NotFoundException('Usuário não possui sprint atual');
    }

    const sprint = sprintAtualRegistro.sprint;

    // Verificar se a sprint tem metas
    if (!sprint.metas || sprint.metas.length === 0) {
      throw new NotFoundException('Sprint atual não possui metas');
    }

    // Verificar se o plano existe
    if (!sprint.plano) {
      throw new NotFoundException('Sprint atual não possui plano associado');
    }

    // Calcular métricas da sprint
    const metricas = await this.calcularMetricasSprintAtual(usuarioId);

    // Formatar dados da sprint (versão simplificada)
    const sprintFormatada = {
      id: sprint.id,
      nome: sprint.nome,
      posicao: sprint.posicao,
      dataInicio: sprint.dataInicio && sprint.dataInicio instanceof Date
        ? sprint.dataInicio.toISOString().split('T')[0]
        : null,
      dataFim: sprint.dataFim && sprint.dataFim instanceof Date
        ? sprint.dataFim.toISOString().split('T')[0]
        : null,
      planoId: sprint.planoId,
      status: sprint.status,
    };

    // Retornar dados completos do dashboard
    return {
      nomePlano: sprint.plano.nome,
      sprint: sprintFormatada,
      metas: sprint.metas,
      metricas,
    };
  }

  // ===== MÉTODOS AUXILIARES =====

  private formatarSprintResposta(sprint: Sprint): any {
    return {
      id: sprint.id,
      nome: sprint.nome,
      posicao: sprint.posicao,
      dataInicio: sprint.dataInicio,
      dataFim: sprint.dataFim,
      planoId: sprint.planoId,
      status: sprint.status,
      metas: sprint.metas.map(meta => ({
        id: meta.id,
        disciplina: meta.disciplina,
        tipo: meta.tipo,
        assunto: meta.assunto,
        comandos: meta.comandos,
        link: meta.link,
        relevancia: meta.relevancia,
        tempoEstudado: meta.tempoEstudado || '00:00',
        desempenho: meta.desempenho || 0,
        status: meta.status || StatusMeta.PENDENTE,
        totalQuestoes: meta.totalQuestoes || 0,
        questoesCorretas: meta.questoesCorretas || 0,
        sprintId: meta.sprintId,
        posicao: meta.posicao,
      })),
    };
  }
}
