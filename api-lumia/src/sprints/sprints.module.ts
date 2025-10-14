import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicoSprint } from './services/servicoSprint';
import { ServicoSprintHistorico } from './services/servicoSprintHistorico';
import { SprintController } from './controllers/sprintController';
import { SprintRedirecionamentoController } from './controllers/sprintRedirecionamentoController';
import { SprintHistoricoController } from './controllers/sprintHistoricoController';
import { SprintMestre } from './entities/sprintMestre.entity';
import { Sprint } from './entities/sprint.entity';
import { MetaMestre } from '../metas/entities/metaMestre.entity';
import { Meta } from '../metas/entities/meta.entity';
import { PlanoMestre } from '../planos/entities/planoMestre.entity';
import { Plano } from '../planos/entities/plano.entity';
import { AlunoPlanos } from '../planos/entities/alunoPlanos.entity';
import { PlanoMestreDisciplina } from '../planos/entities/planoMestreDisciplina.entity';
import { Disciplina } from '../disciplinas/entities/disciplina.entity';
import { Assunto } from '../disciplinas/entities/assunto.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { SprintAtual } from '../sprint-atual/entities/sprintAtual.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SprintMestre,
      Sprint,
      MetaMestre,
      Meta,
      PlanoMestre,
      Plano,
      AlunoPlanos,
      PlanoMestreDisciplina,
      Disciplina,
      Assunto,
      Usuario,
      SprintAtual,
    ]),
  ],
  providers: [ServicoSprint, ServicoSprintHistorico],
  controllers: [
    SprintController,
    SprintRedirecionamentoController,
    SprintHistoricoController
  ],
  exports: [ServicoSprint],
})
export class SprintsModule {}
