import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicoDisciplina } from './services/servicoDisciplina';
import { ServicoCodigoDisciplina } from './services/servicoCodigoDisciplina';
import { ServicoCodigoAssunto } from './services/servicoCodigoAssunto';
import { DisciplinaController } from './controllers/disciplinaController';
import { DisciplinaRedirecionamentoController } from './controllers/disciplinaRedirecionamentoController';
import { Disciplina } from './entities/disciplina.entity';
import { Assunto } from './entities/assunto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Disciplina,
      Assunto,
    ]),
  ],
  controllers: [
    DisciplinaController,
    DisciplinaRedirecionamentoController
  ],
  providers: [ServicoDisciplina, ServicoCodigoDisciplina, ServicoCodigoAssunto],
  exports: [ServicoDisciplina, ServicoCodigoDisciplina, ServicoCodigoAssunto],
})
export class DisciplinasModule {}
