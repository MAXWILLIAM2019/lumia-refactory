import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { GrupoUsuario } from '../usuarios/entities/grupoUsuario.entity';
import { Meta } from '../metas/entities/meta.entity';
import { AlunoPlanos } from '../planos/entities/alunoPlanos.entity';
import { DashboardController } from './controllers/dashboard.controller';
import { ServicoDashboard } from './services/servicoDashboard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, GrupoUsuario, Meta, AlunoPlanos])
  ],
  controllers: [DashboardController],
  providers: [ServicoDashboard],
  exports: [ServicoDashboard]
})
export class AdminModule {}


