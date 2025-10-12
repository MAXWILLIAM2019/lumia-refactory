import { ApiProperty } from '@nestjs/swagger';
import { MetricasSprintDto } from './metricasSprint.dto';

/**
 * DTO de resposta para o dashboard da sprint atual
 * Fornece dados completos para renderização do dashboard do aluno
 */
export class DashboardSprintDto {
  @ApiProperty({
    description: 'Nome do plano de estudo ao qual a sprint pertence',
    example: 'Plano de Estudos - Teste Final'
  })
  nomePlano: string;

  @ApiProperty({
    description: 'Dados básicos da sprint atual',
    example: {
      id: 15,
      nome: 'Sprint 1 - Fundamentos do Sistema',
      posicao: 1,
      dataInicio: '2025-10-09',
      dataFim: '2025-10-16',
      planoId: 6,
      status: 'Em Andamento'
    }
  })
  sprint: {
    id: number;
    nome: string;
    posicao: number;
    dataInicio: string | null;
    dataFim: string | null;
    planoId: number;
    status: string;
  };

  @ApiProperty({
    description: 'Lista completa de metas da sprint atual',
    example: [
      {
        id: 123,
        disciplina: 'Teste de Sistema Completo',
        tipo: 'teoria',
        assunto: 'Assunto Teste 1',
        comandos: 'Estude os conceitos básicos do sistema de teste',
        link: 'https://exemplo.com/material-basico',
        relevancia: 3,
        tempoEstudado: '00:45',
        desempenho: 90,
        status: 'Concluída',
        totalQuestoes: 10,
        questoesCorretas: 9,
        sprintId: 15,
        posicao: 1
      }
    ]
  })
  metas: Array<{
    id: number;
    disciplina: string;
    tipo: string;
    assunto: string;
    comandos: string;
    link: string;
    relevancia: number;
    tempoEstudado: string;
    desempenho: number;
    status: string;
    totalQuestoes: number;
    questoesCorretas: number;
    sprintId: number;
    posicao: number;
  }>;

  @ApiProperty({
    description: 'Métricas calculadas da sprint atual',
    type: MetricasSprintDto
  })
  metricas: MetricasSprintDto;
}
