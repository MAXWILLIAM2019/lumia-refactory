import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { PlanoMestre } from '../../planos/entities/planoMestre.entity';
import { MetaMestre } from '../../metas/entities/metaMestre.entity';
import { StatusMeta } from '../../common/enums/statusMeta.enum';

@Entity('SprintsMestre')
@Index(['planoMestreId', 'posicao'], { unique: true })
export class SprintMestre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'int', default: 0 })
  posicao: number;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ name: 'createdAt', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  @Column({ name: 'plano_mestre_id' })
  planoMestreId: number;

  @Column({ name: 'data_inicio', type: 'date', nullable: true })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'date', nullable: true })
  dataFim: Date;

  @Column({
    type: 'enum',
    enum: StatusMeta,
    default: StatusMeta.PENDENTE,
  })
  status: StatusMeta;

  // Relacionamentos
  @ManyToOne(() => PlanoMestre, (planoMestre) => planoMestre.sprintsMestre)
  @JoinColumn({ name: 'plano_mestre_id' })
  planoMestre: PlanoMestre;

  @OneToMany(() => MetaMestre, (metaMestre) => metaMestre.sprintMestre)
  metasMestre: MetaMestre[];
}
