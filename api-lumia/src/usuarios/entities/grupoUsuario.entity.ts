import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('grupo_usuario')
export class GrupoUsuario {
  @PrimaryGeneratedColumn({ name: 'idgrupo' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nome: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descricao: string;

  // Relacionamento com usuários
  @OneToMany('Usuario', 'grupo')
  usuarios: Usuario[];
}
