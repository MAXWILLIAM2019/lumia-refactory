import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para resumo das sprints finalizadas
 * Contém informações completas das sprints concluídas
 */
export class SprintFinalizadaResumoDto {
  @ApiProperty({
    description: 'Nome da sprint finalizada',
    example: 'Sprint 1 - Fundamentos Básicos'
  })
  nomeSprint: string;

  @ApiProperty({
    description: 'Cargo/profissão do plano de estudos',
    example: 'Analista'
  })
  cargoPlano: string;

  @ApiProperty({
    description: 'Data de conclusão da sprint (ou data da última meta concluída se sprint não tiver data)',
    example: '2025-10-15'
  })
  dataConclusaoSprint: string;

  @ApiProperty({
    description: 'Status da sprint (sempre "concluida" para sprints finalizadas)',
    example: 'concluida'
  })
  statusSprint: string;

  @ApiProperty({
    description: 'Percentual de progresso da sprint (sempre 100% para concluídas)',
    example: 100.00
  })
  progressoSprint: number;
}
