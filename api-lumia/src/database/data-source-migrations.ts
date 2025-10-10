import { DataSource } from 'typeorm';

// Entidades - lista explícita para migrações
import { Usuario } from '../usuarios/entities/usuario.entity';
import { GrupoUsuario } from '../usuarios/entities/grupoUsuario.entity';
import { AlunoInfo } from '../usuarios/entities/alunoInfo.entity';
import { AdministradorInfo } from '../usuarios/entities/administradorInfo.entity';
import { PlanoMestre } from '../planos/entities/planoMestre.entity';
import { Plano } from '../planos/entities/plano.entity';
import { AlunoPlanos } from '../planos/entities/alunoPlanos.entity';
import { PlanoMestreDisciplina } from '../planos/entities/planoMestreDisciplina.entity';
import { SprintMestre } from '../sprints/entities/sprintMestre.entity';
import { Sprint } from '../sprints/entities/sprint.entity';
import { MetaMestre } from '../metas/entities/metaMestre.entity';
import { Meta } from '../metas/entities/meta.entity';
import { Disciplina } from '../disciplinas/entities/disciplina.entity';
import { Assunto } from '../disciplinas/entities/assunto.entity';
import { SprintAtual } from '../sprint-atual/entities/sprintAtual.entity';
import { RankingSemanal } from '../ranking/entities/rankingSemanal.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1127',
  database: process.env.DB_DATABASE || 'mentoring',
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
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
