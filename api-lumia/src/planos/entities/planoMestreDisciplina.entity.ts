import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PlanoMestre } from './planoMestre.entity';
import { Disciplina } from '../../disciplinas/entities/disciplina.entity';

@Entity('PlanoMestreDisciplina')
export class PlanoMestreDisciplina {
  @PrimaryColumn({ name: 'plano_mestre_id' })
  planoMestreId: number;

  @PrimaryColumn({ name: 'disciplina_id' })
  disciplinaId: number;

  @Column({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => PlanoMestre, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plano_mestre_id' })
  planoMestre: PlanoMestre;

  @ManyToOne(() => Disciplina, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;
}
