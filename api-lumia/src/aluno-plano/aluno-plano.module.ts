import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlunoPlano } from './entities/alunoPlano.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Plano } from '../planos/entities/plano.entity';
import { ServicoAlunoPlano } from './services/servicoAlunoPlano';
import { AlunoPlanoController } from './controllers/alunoPlanoController';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlunoPlano, Usuario, Plano]),
  ],
  providers: [ServicoAlunoPlano],
  controllers: [AlunoPlanoController],
  exports: [ServicoAlunoPlano],
})
export class AlunoPlanoModule {}
