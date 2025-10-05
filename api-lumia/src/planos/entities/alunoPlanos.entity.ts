import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Plano } from './plano.entity';
import { StatusPlano } from '../../common/enums/statusPlano.enum';

@Entity('AlunoPlanos')
export class AlunoPlanos {
  @PrimaryColumn({ name: 'idusuario' })
  usuarioId: number;

  @PrimaryColumn({ name: 'plano_id' })
  planoId: number;

  @Column({ name: 'data_inicio', type: 'timestamptz' })
  dataInicio: Date;

  @Column({ name: 'data_previsao_termino', type: 'timestamptz', nullable: true })
  dataPrevisaoTermino: Date;

  @Column({ name: 'data_conclusao', type: 'timestamptz', nullable: true })
  dataConclusao: Date;

  @Column({ type: 'int', default: 0 })
  progresso: number;

  @Column({
    type: 'enum',
    enum: StatusPlano,
    default: StatusPlano.NAO_INICIADO,
  })
  status: StatusPlano;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'boolean', nullable: true })
  ativo: boolean;

  // Relacionamentos
  @ManyToOne(() => Usuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'idusuario' })
  usuario: Usuario;

  @ManyToOne(() => Plano, (plano) => plano.id)
  @JoinColumn({ name: 'plano_id' })
  plano: Plano;
}
