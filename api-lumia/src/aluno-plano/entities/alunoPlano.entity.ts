import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Plano } from '../../planos/entities/plano.entity';

@Entity('AlunoPlano')
export class AlunoPlano {
  @PrimaryColumn({ name: 'idusuario' })
  idusuario: number;

  @PrimaryColumn({ name: 'PlanoId' })
  planoId: number;

  @Column({ name: 'dataInicio', type: 'timestamptz', default: () => 'now()' })
  dataInicio: Date;

  @Column({ name: 'dataPrevisaoTermino', type: 'timestamptz', nullable: true })
  dataPrevisaoTermino: Date;

  @Column({ name: 'dataConclusao', type: 'timestamptz', nullable: true })
  dataConclusao: Date;

  @Column({ type: 'int', default: 0 })
  progresso: number;

  @Column({
    type: 'enum',
    enum: ['não iniciado', 'em andamento', 'concluído', 'cancelado'],
    default: 'não iniciado',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ name: 'createdAt', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => Usuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'idusuario' })
  usuario: Usuario;

  @ManyToOne(() => Plano, (plano) => plano.id)
  @JoinColumn({ name: 'PlanoId' })
  plano: Plano;
}
