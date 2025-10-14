import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para resumo das sprints pendentes
 * Contém apenas informações básicas para exibição na lista
 */
export class SprintPendenteResumoDto {
  @ApiProperty({
    description: 'Nome da sprint pendente',
    example: 'Sprint 2 - Conceitos Avançados'
  })
  nomeSprint: string;
}
