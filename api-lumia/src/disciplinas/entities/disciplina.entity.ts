import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Assunto } from './assunto.entity';
import { PlanoMestreDisciplina } from '../../planos/entities/planoMestreDisciplina.entity';

/**
 * Entidade Disciplina
 * 
 * Representa uma disciplina do sistema com suporte a versionamento.
 * Quando uma disciplina está sendo usada por planos e precisa ser atualizada,
 * o sistema cria automaticamente uma nova versão para manter a integridade
 * dos planos existentes.
 */
@Entity('Disciplinas')
export class Disciplina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo: string;

  @Column({ type: 'int', default: 1 })
  versao: number;

  @Column({ type: 'boolean', default: true })
  ativa: boolean;

  @Column({ name: 'disciplina_origem_id', nullable: true })
  disciplinaOrigemId: number;

  @Column({ name: 'createdAt', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  // Relacionamentos
  @OneToMany(() => Assunto, (assunto) => assunto.disciplina)
  assuntos: Assunto[];


  // Auto-relacionamento para versionamento
  @ManyToOne(() => Disciplina, (disciplina) => disciplina.versoes)
  @JoinColumn({ name: 'disciplina_origem_id' })
  disciplinaOrigem: Disciplina;

  @OneToMany(() => Disciplina, (disciplina) => disciplina.disciplinaOrigem)
  versoes: Disciplina[];
}
