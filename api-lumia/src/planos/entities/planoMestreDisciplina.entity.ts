import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PlanoMestre } from './planoMestre.entity';
import { Disciplina } from '../../disciplinas/entities/disciplina.entity';

@Entity('PlanoMestreDisciplina')
export class PlanoMestreDisciplina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'plano_mestre_id' })
  planoMestreId: number;

  @Column({ name: 'disciplina_id' })
  disciplinaId: number;

  @Column({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => PlanoMestre, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plano_mestre_id' })
  planoMestre: PlanoMestre;

  @ManyToOne(() => Disciplina, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;
}
