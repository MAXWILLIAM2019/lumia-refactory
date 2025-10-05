import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { MetaMestre } from './metaMestre.entity';
import { StatusMeta } from '../../common/enums/statusMeta.enum';
import { TipoMeta } from '../../common/enums/tipoMeta.enum';

@Entity('Meta')
export class Meta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  disciplina: string;

  @Column({
    type: 'enum',
    enum: TipoMeta,
  })
  tipo: TipoMeta;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comandos: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string;

  @Column({ type: 'int' })
  relevancia: number;

  @Column({ name: 'tempo_estudado', type: 'varchar', length: 255, default: '00:00', nullable: true })
  tempoEstudado: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, nullable: true })
  desempenho: number;

  @Column({
    type: 'enum',
    enum: StatusMeta,
    default: StatusMeta.PENDENTE,
    nullable: true,
  })
  status: StatusMeta;

  @Column({ name: 'total_questoes', type: 'int', default: 0, nullable: true })
  totalQuestoes: number;

  @Column({ name: 'questoes_corretas', type: 'int', default: 0, nullable: true })
  questoesCorretas: number;

  @Column({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'sprint_id', nullable: true })
  sprintId: number;

  @Column({ name: 'meta_mestre_id', nullable: true })
  metaMestreId: number;

  @Column({ type: 'int', default: 0 })
  posicao: number;

  // Relacionamentos
  @ManyToOne(() => Sprint, (sprint) => sprint.metas)
  @JoinColumn({ name: 'sprint_id' })
  sprint: Sprint;

  @ManyToOne(() => MetaMestre, (metaMestre) => metaMestre.id)
  @JoinColumn({ name: 'meta_mestre_id' })
  metaMestre: MetaMestre;
}
