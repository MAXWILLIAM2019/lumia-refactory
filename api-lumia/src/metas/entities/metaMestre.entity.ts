import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SprintMestre } from '../../sprints/entities/sprintMestre.entity';
import { Disciplina } from '../../disciplinas/entities/disciplina.entity';
import { Assunto } from '../../disciplinas/entities/assunto.entity';
import { StatusMeta } from '../../common/enums/statusMeta.enum';
import { TipoMeta } from '../../common/enums/tipoMeta.enum';

@Entity('MetasMestre')
export class MetaMestre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'disciplina_id' })
  disciplinaId: number;

  @Column({ type: 'varchar', length: 255 })
  disciplina: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ name: 'assunto_id' })
  assuntoId: number;

  @Column({ type: 'varchar', length: 255 })
  assunto: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comandos: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string;

  @Column({ type: 'int' })
  relevancia: number;

  @Column({ name: 'createdAt', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  @Column({ name: 'sprint_mestre_id' })
  sprintMestreId: number;

  @Column({ name: 'tempo_estudado', type: 'varchar', length: 255, default: '00:00', nullable: true })
  tempoEstudado: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, nullable: true })
  desempenho: number;

  @Column({
    type: 'enum',
    enum: StatusMeta,
    default: StatusMeta.PENDENTE,
  })
  status: StatusMeta;

  @Column({ name: 'total_questoes', type: 'int', default: 0, nullable: true })
  totalQuestoes: number;

  @Column({ name: 'questoes_corretas', type: 'int', default: 0, nullable: true })
  questoesCorretas: number;

  @Column({ type: 'int', default: 0 })
  posicao: number;

  // Relacionamentos
  @ManyToOne(() => Disciplina, (disciplina) => disciplina.id)
  @JoinColumn({ name: 'disciplina_id' })
  disciplinaEntity: Disciplina;

  @ManyToOne(() => Assunto, (assunto) => assunto.id)
  @JoinColumn({ name: 'assunto_id' })
  assuntoEntity: Assunto;

  @ManyToOne(() => SprintMestre, (sprintMestre) => sprintMestre.metasMestre)
  @JoinColumn({ name: 'sprint_mestre_id' })
  sprintMestre: SprintMestre;
}
