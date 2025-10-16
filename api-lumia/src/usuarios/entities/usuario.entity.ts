import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { GrupoUsuario } from './grupoUsuario.entity';
import { AlunoInfo } from './alunoInfo.entity';
import { AdministradorInfo } from './administradorInfo.entity';
import { AlunoPlanos } from '../../planos/entities/alunoPlanos.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'idusuario' })
  id: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  login: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  senha: string;

  @Column({ type: 'boolean', default: true })
  situacao: boolean;

  @Column({ type: 'varchar', length: 120 })
  nome: string;

  @Column({ type: 'varchar', length: 14, unique: true, nullable: true })
  cpf: string;

  @Column({ name: 'grupo' })
  grupoId: number;

  @Column({ name: 'createdAt', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => GrupoUsuario, (grupo) => grupo.usuarios)
  @JoinColumn({ name: 'grupo' })
  grupo: GrupoUsuario;

  @OneToOne('AlunoInfo', 'usuario')
  alunoInfo: AlunoInfo;

  @OneToOne('AdministradorInfo', 'usuario')
  administradorInfo: AdministradorInfo;

  @OneToMany(() => AlunoPlanos, (alunoPlano) => alunoPlano.usuario)
  alunoPlanos: AlunoPlanos[];
}
