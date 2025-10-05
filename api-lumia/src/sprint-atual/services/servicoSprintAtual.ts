import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SprintAtual } from '../entities/sprintAtual.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { Plano } from '../../planos/entities/plano.entity';
import { AlunoPlanos } from '../../planos/entities/alunoPlanos.entity';
import { Meta } from '../../metas/entities/meta.entity';
import { AtualizarSprintAtualDto } from '../dto/atualizarSprintAtual.dto';
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
        titulo: meta.titulo,
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
