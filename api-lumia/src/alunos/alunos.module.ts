import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlunoController } from './controllers/alunoController';
import { ServicoAluno } from './services/servicoAluno';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';

/**
 * Módulo específico para funcionalidades do domínio de alunos
 *
 * Este módulo contém apenas funcionalidades específicas do domínio de alunos,
 * como gerenciamento de planos, sprints e métricas.
 *
 * As operações CRUD básicas de alunos foram consolidadas no módulo de usuários.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]), // Reduzido para apenas o necessário
    forwardRef(() => UsuariosModule), // Importação circular para evitar dependências cíclicas
  ],
  controllers: [
    AlunoController
  ],
  providers: [ServicoAluno],
  exports: [ServicoAluno],
})
export class AlunosModule {}
