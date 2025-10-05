import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AutenticacaoController } from './controllers/autenticacaoController';
import { ServicoAutenticacao } from './services/servicoAutenticacao';
import { EstrategiaJwt } from './strategies/estrategiaJwt';

import { Usuario } from '../usuarios/entities/usuario.entity';
import { GrupoUsuario } from '../usuarios/entities/grupoUsuario.entity';
import { AlunoInfo } from '../usuarios/entities/alunoInfo.entity';
import { AdministradorInfo } from '../usuarios/entities/administradorInfo.entity';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([Usuario, GrupoUsuario, AlunoInfo, AdministradorInfo]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: process.env.JWT_SECRET || 'sis_mentoria_secret_key_2024',
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AutenticacaoController],
  providers: [ServicoAutenticacao, EstrategiaJwt],
  exports: [ServicoAutenticacao, EstrategiaJwt],
})
export class AuthModule {}
