import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para métricas da sprint atual
 * Contém estatísticas calculadas da sprint e suas metas
 */
export class MetricasSprintDto {
  @ApiProperty({
    description: 'ID da sprint atual',
    example: 15,
  })
  sprintId: number;

  @ApiProperty({
    description: 'Total de metas na sprint',
    example: 3,
  })
  totalMetas: number;

  @ApiProperty({
    description: 'Número de metas concluídas',
    example: 1,
  })
  metasConcluidas: number;

  @ApiProperty({
    description: 'Percentual de conclusão da sprint (0-100)',
    example: 33.33,
  })
  percentualConclusao: number;

  @ApiProperty({
    description: 'Desempenho médio das metas concluídas (0-100)',
    example: 90.0,
  })
  desempenhoMedio: number;

  @ApiProperty({
    description: 'Total de horas estudadas em todas as metas (formato HH:MM)',
    example: '02:30',
  })
  totalHorasEstudadas: string;


  @ApiProperty({
    description: 'Média de horas estudadas por dia desde o início da sprint (formato HH:MM)',
    example: '00:45',
  })
  mediaHorasDiaria: string;

  @ApiProperty({
    description: 'Número de disciplinas únicas na sprint',
    example: 2,
  })
  totalDisciplinas: number;

  @ApiProperty({
    description: 'Total de questões resolvidas em todas as metas concluídas',
    example: 45,
  })
  questoesTotaisResolvidas: number;
}
