import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { StatusCadastro } from '../../common/enums/statusCadastro.enum';
import { StatusPagamento } from '../../common/enums/statusPagamento.enum';

@Entity('aluno_info')
export class AlunoInfo {
  @PrimaryGeneratedColumn({ name: 'idalunoinfo' })
  id: number;

  @Column({ name: 'idusuario' })
  idusuario: number;

  @Column({ type: 'varchar', length: 120 })
  email: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cpf: string;

  @Column({ name: 'data_nascimento', type: 'date', nullable: true })
  dataNascimento: Date;

  @Column({ name: 'data_criacao', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string;

  @Column({
    name: 'status_cadastro',
    type: 'enum',
    enum: StatusCadastro,
    default: StatusCadastro.PRE_CADASTRO,
  })
  statusCadastro: StatusCadastro;

  @Column({
    name: 'status_pagamento',
    type: 'enum',
    enum: StatusPagamento,
    default: StatusPagamento.PENDENTE,
  })
  statusPagamento: StatusPagamento;

  @Column({ type: 'varchar', length: 9, nullable: true })
  cep: string;

  // Campo asaas_external_reference removido do banco de dados

  @Column({ type: 'text', nullable: true })
  biografia: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  formacao: string;

  @Column({ name: 'is_trabalhando', type: 'boolean', default: false })
  is_trabalhando: boolean;

  @Column({ name: 'is_aceita_termos', type: 'boolean', default: false })
  is_aceita_termos: boolean;

  // Configurações de notificação (mantendo snake_case para compatibilidade)
  @Column({ name: 'notif_novidades_plataforma', type: 'boolean', default: true })
  notif_novidades_plataforma: boolean;

  @Column({ name: 'notif_mensagens_mentor', type: 'boolean', default: true })
  notif_mensagens_mentor: boolean;

  @Column({ name: 'notif_novo_material', type: 'boolean', default: true })
  notif_novo_material: boolean;

  @Column({ name: 'notif_atividades_simulados', type: 'boolean', default: false })
  notif_atividades_simulados: boolean;

  @Column({ name: 'notif_mentorias', type: 'boolean', default: false })
  notif_mentorias: boolean;

  // Relacionamento
  @OneToOne(() => Usuario, (usuario) => usuario.alunoInfo)
  @JoinColumn({ name: 'idusuario' })
  usuario: Usuario;
}
