import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Disciplina } from './disciplina.entity';

/**
 * Entidade Assunto
 * 
 * Representa um assunto dentro de uma disciplina.
 * Cada assunto pertence a uma disciplina específica e pode ser usado
 * para organizar melhor o conteúdo das disciplinas.
 */
@Entity('Assuntos')
export class Assunto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ name: 'disciplina_id' })
  disciplinaId: number;

  @Column({ name: 'createdAt', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => Disciplina, (disciplina) => disciplina.assuntos)
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;
}
