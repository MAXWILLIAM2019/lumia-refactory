import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SprintMestre } from '../../sprints/entities/sprintMestre.entity';
import { PlanoMestreDisciplina } from './planoMestreDisciplina.entity';

@Entity('PlanosMestre')
export class PlanoMestre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo: string;

  @Column({ type: 'varchar', length: 255 })
  cargo: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'int', nullable: true })
  duracao: number | null;

  @Column({ type: 'varchar', length: 10, default: '1.0' })
  versao: string;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ name: 'createdAt', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  // Relacionamento com sprints mestre
  @OneToMany(() => SprintMestre, (sprintMestre) => sprintMestre.planoMestre)
  sprintsMestre: SprintMestre[];
}
