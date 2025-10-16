import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PlanosModule } from './planos/planos.module';
import { SprintsModule } from './sprints/sprints.module';
import { MetasModule } from './metas/metas.module';
import { AlunoPlanoModule } from './aluno-plano/aluno-plano.module';
import { AlunosModule } from './alunos/alunos.module';
import { DisciplinasModule } from './disciplinas/disciplinas.module';
import { SprintAtualModule } from './sprint-atual/sprint-atual.module';
import { RankingModule } from './ranking/ranking.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Configuração global de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Configuração do banco de dados
    DatabaseModule,
    
    // Módulo de autenticação
    AuthModule,
    
    // Módulo de usuários
    UsuariosModule,
    
    // Módulo de planos
    PlanosModule,
    
    // Módulo de sprints
    SprintsModule,
    
    // Módulo de metas
    MetasModule,
    
    // Módulo de aluno-plano
    AlunoPlanoModule,
    
    // Módulo de alunos
    AlunosModule,
    
    // Módulo de disciplinas
    DisciplinasModule,
    
    // Módulo de sprint atual
    SprintAtualModule,
    
    // Módulo de ranking
    RankingModule,

    // Módulo administrativo
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
