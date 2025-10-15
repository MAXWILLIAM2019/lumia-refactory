import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para resumo da sprint atual (em andamento)
 * Contém informações básicas para exibição no histórico
 */
export class SprintAtualResumoDto {
  @ApiProperty({
    description: 'ID da sprint atual',
    example: 15
  })
  idSprint: number;

  @ApiProperty({
    description: 'Nome da sprint atual',
    example: 'Sprint 1 - Fundamentos do Sistema'
  })
  nomeSprint: string;

  @ApiProperty({
    description: 'Cargo/profissão do plano de estudos',
    example: 'Analista'
  })
  cargoPlano: string;

  @ApiProperty({
    description: 'Número de metas ainda pendentes na sprint atual',
    example: 2
  })
  metaPendentes: number;

  @ApiProperty({
    description: 'Status da sprint (sempre "em andamento" para sprint atual)',
    example: 'em andamento'
  })
  status: string;

  @ApiProperty({
    description: 'Percentual de progresso da sprint (metas concluídas / total de metas * 100)',
    example: 33.33
  })
  progressoSprint: number;
}
