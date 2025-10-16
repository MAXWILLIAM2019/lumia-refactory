import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Plano } from '../../planos/entities/plano.entity';
import { SprintMestre } from './sprintMestre.entity';
import { Meta } from '../../metas/entities/meta.entity';
import { SprintAtual } from '../../sprint-atual/entities/sprintAtual.entity';
import { StatusMeta } from '../../common/enums/statusMeta.enum';

@Entity('Sprints')
export class Sprint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ name: 'data_inicio', type: 'date' })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'date' })
  dataFim: Date;

  @Column({
    type: 'enum',
    enum: StatusMeta,
    default: StatusMeta.PENDENTE,
  })
  status: StatusMeta;

  @Column({ type: 'int', default: 0 })
  posicao: number;

  @Column({ name: 'sprint_mestre_id', nullable: true })
  sprintMestreId: number;

  @Column({ name: 'plano_id' })
  planoId: number;

  @Column({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => Plano, (plano) => plano.sprints)
  @JoinColumn({ name: 'plano_id' })
  plano: Plano;

  @ManyToOne(() => SprintMestre, (sprintMestre) => sprintMestre.id)
  @JoinColumn({ name: 'sprint_mestre_id' })
  sprintMestre: SprintMestre;

  @OneToMany(() => Meta, (meta) => meta.sprint)
  metas: Meta[];

  @OneToMany(() => SprintAtual, (sprintAtual) => sprintAtual.sprint)
  sprintAtual: SprintAtual[];
}
