import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para o card de resumo dos detalhes da sprint
 * Contém informações principais e status da sprint
 */
export class SprintDetalhesResumoDto {
  @ApiProperty({
    description: 'Status atual da sprint',
    example: 'em andamento',
    enum: ['em andamento', 'concluida', 'pendente']
  })
  status: string;

  @ApiProperty({
    description: 'Nome da sprint',
    example: 'Sprint 1 - Fundamentos do Sistema'
  })
  nomeSprint: string;

  @ApiProperty({
    description: 'Cargo/profissão do plano de estudos',
    example: 'Analista'
  })
  cargoPlano: string;

  @ApiProperty({
    description: 'Desempenho global da sprint (rendimento de acertos das metas concluídas)',
    example: 87.5,
    nullable: true
  })
  desempenhoSprint: number | null;

  @ApiProperty({
    description: 'Número de metas ainda pendentes na sprint',
    example: 2
  })
  metaPendentes: number;

  @ApiProperty({
    description: 'Total de metas na sprint',
    example: 6
  })
  totalMetas: number;

  @ApiProperty({
    description: 'Total de disciplinas distintas na sprint',
    example: 3
  })
  totalDisciplinas: number;

  @ApiProperty({
    description: 'Data da última atualização (conclusão da última meta)',
    example: '2025-10-15T14:30:00.000Z',
    nullable: true
  })
  ultimaAtualizacao: string | null;
}
