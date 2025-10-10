import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Usuario,
  GrupoUsuario,
  AlunoInfo,
  AdministradorInfo,
  Disciplina,
  Assunto,
  PlanoMestreDisciplina,
  PlanoMestre,
  Plano,
  AlunoPlanos,
  SprintMestre,
  Sprint,
  MetaMestre,
  Meta,
  SprintAtual,
  RankingSemanal,
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '1127',
        database: 'mentoring',
        entities: [
          Usuario,
          GrupoUsuario,
          AlunoInfo,
          AdministradorInfo,
          Disciplina,
          Assunto,
          PlanoMestreDisciplina,
          PlanoMestre,
          Plano,
          AlunoPlanos,
          SprintMestre,
          Sprint,
          MetaMestre,
          Meta,
          SprintAtual,
          RankingSemanal,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
