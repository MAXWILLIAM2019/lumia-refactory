import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para o card de informações complementares dos detalhes da sprint
 * Contém dados temporais e métricas de progresso
 */
export class SprintDetalhesComplementoDto {
  @ApiProperty({
    description: 'Percentual de progresso da sprint (metas concluídas / total de metas * 100)',
    example: 33.33
  })
  progressoSprint: number;

  @ApiProperty({
    description: 'Data de início da sprint',
    example: '2025-10-09'
  })
  dataInicio: string;

  @ApiProperty({
    description: 'Data de fim da sprint',
    example: '2025-10-16'
  })
  dataFim: string;

  @ApiProperty({
    description: 'Tempo médio estudado por meta (formato HH:MM)',
    example: '00:45',
    nullable: true
  })
  tempoMedioMeta: string | null;
}
