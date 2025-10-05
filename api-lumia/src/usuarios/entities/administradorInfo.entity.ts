import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('administrador_info')
export class AdministradorInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_usuario', unique: true })
  idusuario: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 11, nullable: true, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telefone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  departamento: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cargo: string;

  @Column({ name: 'data_criacao', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  data_criacao: Date;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  // Relacionamento
  @OneToOne(() => Usuario, (usuario) => usuario.administradorInfo)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
