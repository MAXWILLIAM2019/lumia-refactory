import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

/**
 * Entidade RankingSemanal
 * 
 * Armazena o ranking semanal dos alunos baseado no desempenho nas metas.
 * Esta tabela é populada automaticamente por um job que executa 3x ao dia.
 * 
 * Funcionalidades:
 * - Ranking baseado em metas concluídas da semana atual
 * - Cálculo de pontuação: (acertos * 10) + (percentual * 0.5) + (quantidade * 0.1)
 * - Atualização automática via job
 * - Limpeza automática de dados antigos
 */
@Entity('ranking_semanal')
@Unique(['usuarioId', 'semanaInicio']) // Garante que cada usuário tenha apenas um registro por semana
export class RankingSemanal {
  @PrimaryGeneratedColumn({ name: 'id_ranking' })
  id: number;

  @Column({ name: 'id_usuario' })
  usuarioId: number;

  @Column({ name: 'nome_usuario', type: 'varchar', length: 100 })
  nomeUsuario: string;

  @Column({ name: 'email_usuario', type: 'varchar', length: 120 })
  emailUsuario: string;

  @Column({ name: 'total_questoes', type: 'int', default: 0 })
  totalQuestoes: number;

  @Column({ name: 'total_acertos', type: 'int', default: 0 })
  totalAcertos: number;

  @Column({ name: 'percentual_acerto', type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentualAcerto: number;

  @Column({ name: 'pontuacao_final', type: 'decimal', precision: 8, scale: 2, default: 0 })
  pontuacaoFinal: number;

  @Column({ type: 'int', nullable: true })
  posicao: number;

  @Column({ name: 'semana_inicio', type: 'date' })
  semanaInicio: Date;

  @Column({ name: 'semana_fim', type: 'date' })
  semanaFim: Date;

  @Column({ name: 'ultima_atualizacao', type: 'timestamptz', default: () => 'now()' })
  ultimaAtualizacao: Date;

  // Relacionamento
  @ManyToOne(() => Usuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
