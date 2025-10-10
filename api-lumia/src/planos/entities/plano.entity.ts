import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PlanoMestre } from './planoMestre.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';

@Entity('Plano')
export class Plano {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 255 })
  cargo: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'int' })
  duracao: number;

  @Column({ name: 'plano_mestre_id', nullable: true })
  planoMestreId: number;

  @Column({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => PlanoMestre, (planoMestre) => planoMestre.id)
  @JoinColumn({ name: 'plano_mestre_id' })
  planoMestre: PlanoMestre;

  @OneToMany(() => Sprint, (sprint) => sprint.plano)
  sprints: Sprint[];
}
