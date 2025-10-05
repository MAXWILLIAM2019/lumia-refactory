import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicoSprintAtual } from './services/servicoSprintAtual';
import { SprintAtualController } from './controllers/sprintAtualController';
import { SprintAtual } from './entities/sprintAtual.entity';
import { Sprint } from '../sprints/entities/sprint.entity';
import { Plano } from '../planos/entities/plano.entity';
import { AlunoPlanos } from '../planos/entities/alunoPlanos.entity';
import { Meta } from '../metas/entities/meta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SprintAtual,
      Sprint,
      Plano,
      AlunoPlanos,
      Meta,
    ]),
  ],
  controllers: [SprintAtualController],
  providers: [ServicoSprintAtual],
  exports: [ServicoSprintAtual],
})
export class SprintAtualModule {}
