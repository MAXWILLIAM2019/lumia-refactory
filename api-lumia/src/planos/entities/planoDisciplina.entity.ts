import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Plano } from './plano.entity';
import { Disciplina } from '../../disciplinas/entities/disciplina.entity';

@Entity('PlanoDisciplina')
export class PlanoDisciplina {
  @PrimaryColumn({ name: 'plano_id' })
  planoId: number;

  @PrimaryColumn({ name: 'disciplina_id' })
  disciplinaId: number;

  @Column({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => Plano, (plano) => plano.planoDisciplinas)
  @JoinColumn({ name: 'plano_id' })
  plano: Plano;

  @ManyToOne(() => Disciplina, (disciplina) => disciplina.planoDisciplinas)
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;
}


