import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanoController } from './controllers/planoController';
import { PlanoRedirecionamentoController } from './controllers/planoRedirecionamentoController';
import { ServicoPlano } from './services/servicoPlano';
import { PlanoMestre } from './entities/planoMestre.entity';
import { Plano } from './entities/plano.entity';
import { AlunoPlanos } from './entities/alunoPlanos.entity';
import { PlanoDisciplina } from './entities/planoDisciplina.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Disciplina } from '../disciplinas/entities/disciplina.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanoMestre,
      Plano,
      AlunoPlanos,
      PlanoDisciplina,
      Usuario,
      Disciplina,
    ]),
  ],
  controllers: [
    PlanoController,
    PlanoRedirecionamentoController
  ],
  providers: [ServicoPlano],
  exports: [ServicoPlano],
})
export class PlanosModule {}
