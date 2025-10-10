import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicoSprint } from './services/servicoSprint';
import { SprintController } from './controllers/sprintController';
import { SprintRedirecionamentoController } from './controllers/sprintRedirecionamentoController';
import { SprintMestre } from './entities/sprintMestre.entity';
import { Sprint } from './entities/sprint.entity';
import { MetaMestre } from '../metas/entities/metaMestre.entity';
import { Meta } from '../metas/entities/meta.entity';
import { PlanoMestre } from '../planos/entities/planoMestre.entity';
import { Plano } from '../planos/entities/plano.entity';
import { PlanoMestreDisciplina } from '../planos/entities/planoMestreDisciplina.entity';
import { Disciplina } from '../disciplinas/entities/disciplina.entity';
import { Assunto } from '../disciplinas/entities/assunto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SprintMestre,
      Sprint,
      MetaMestre,
      Meta,
      PlanoMestre,
      Plano,
      PlanoMestreDisciplina,
      Disciplina,
      Assunto,
    ]),
  ],
  providers: [ServicoSprint],
  controllers: [
    SprintController,
    SprintRedirecionamentoController
  ],
  exports: [ServicoSprint],
})
export class SprintsModule {}
