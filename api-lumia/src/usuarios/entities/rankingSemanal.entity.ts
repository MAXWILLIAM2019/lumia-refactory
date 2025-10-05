import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('ranking_semanal')
export class RankingSemanal {
  @PrimaryGeneratedColumn({ name: 'id_ranking' })
  id: number;

  @Column({ name: 'id_usuario' })
  usuarioId: number;

  @Column({ type: 'varchar', length: 100 })
  nomeUsuario: string;

  @Column({ type: 'varchar', length: 120 })
  emailUsuario: string;

  @Column({ type: 'int', default: 0 })
  totalQuestoes: number;

  @Column({ type: 'int', default: 0 })
  totalAcertos: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentualAcerto: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  pontuacaoFinal: number;

  @Column({ type: 'int', nullable: true })
  posicao: number;

  @Column({ type: 'date' })
  semanaInicio: Date;

  @Column({ type: 'date' })
  semanaFim: Date;

  @Column({ type: 'timestamptz' })
  ultimaAtualizacao: Date;

  // Relacionamento
  @ManyToOne(() => Usuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
