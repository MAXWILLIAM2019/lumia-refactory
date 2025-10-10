import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanoController } from './controllers/planoController';
import { PlanoAlunoController } from './controllers/planoAlunoController';
import { ServicoPlano } from './services/servicoPlano';
import { PlanoMestre } from './entities/planoMestre.entity';
import { Plano } from './entities/plano.entity';
import { AlunoPlanos } from './entities/alunoPlanos.entity';
import { PlanoMestreDisciplina } from './entities/planoMestreDisciplina.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Disciplina } from '../disciplinas/entities/disciplina.entity';
import { Sprint } from '../sprints/entities/sprint.entity';
import { SprintMestre } from '../sprints/entities/sprintMestre.entity';
import { Meta } from '../metas/entities/meta.entity';
import { MetaMestre } from '../metas/entities/metaMestre.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanoMestre,
      Plano,
      AlunoPlanos,
      PlanoMestreDisciplina,
      Usuario,
      Disciplina,
      Sprint,
      SprintMestre,
      Meta,
      MetaMestre,
    ]),
  ],
  controllers: [
    PlanoController,                    // ✅ Apenas operações de mestres
    PlanoAlunoController                // ✅ Novo: Operações de alunos
  ],
  providers: [ServicoPlano],
  exports: [ServicoPlano],
})
export class PlanosModule {}
