import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';

/**
 * Entidade SprintAtual
 * 
 * Armazena a sprint atual de cada aluno.
 * Controla qual sprint o aluno está fazendo atualmente dentro do seu plano de estudos.
 * 
 * Funcionalidades:
 * - Gerencia o progresso do aluno através das sprints
 * - Permite avançar para a próxima sprint
 * - Mantém histórico de atualizações
 */
@Entity('SprintAtual')
@Unique(['usuarioId']) // Garante que cada usuário tenha apenas uma sprint atual
export class SprintAtual {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'idusuario' })
  usuarioId: number;

  @Column({ name: 'sprint_id' })
  sprintId: number;

  @Column({ name: 'data_atualizacao', type: 'timestamptz', default: () => 'now()' })
  dataAtualizacao: Date;

  @Column({ name: 'createdAt', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => Usuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'idusuario' })
  usuario: Usuario;

  @ManyToOne(() => Sprint, (sprint) => sprint.id)
  @JoinColumn({ name: 'sprint_id' })
  sprint: Sprint;
}
