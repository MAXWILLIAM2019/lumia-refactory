import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para métricas do dashboard administrativo
 * Contém todas as métricas calculadas para exibição no painel administrativo
 */
export class MetricasDashboardDto {
  @ApiProperty({
    description: 'Total de alunos ativos (todos os usuários cadastrados do grupo "aluno" independente de planos)',
    example: 25,
    minimum: 0
  })
  totalAlunosAtivos: number;

  @ApiProperty({
    description: 'Total de alunos criados no sistema no mês corrente',
    example: 5,
    minimum: 0
  })
  alunosMatriculadosMes: number;

  @ApiProperty({
    description: 'Percentual de metas concluídas no mês corrente (metas concluídas / total de metas criadas) * 100',
    example: 78.89,
    minimum: 0,
    maximum: 100
  })
  percentualMetasConcluidasMes: number;

  @ApiProperty({
    description: 'Média diária de tempo de estudo dos alunos ativos baseada em dias com atividade real (HH:MM)',
    example: '02:30'
  })
  tempoEstudoDiarioMedio: string;
}


