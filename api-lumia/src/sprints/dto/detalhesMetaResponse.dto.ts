import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para detalhes de uma meta específica
 * Retorna informações completas sobre uma meta dentro de uma sprint
 */
export class DetalhesMetaResponseDto {
  @ApiProperty({
    description: 'Nome da disciplina da meta',
    example: 'Matemática Básica'
  })
  disciplina: string;

  @ApiProperty({
    description: 'Status atual da meta',
    example: 'Concluída',
    enum: ['Pendente', 'Em Andamento', 'Concluída']
  })
  status: string;

  @ApiProperty({
    description: 'Assunto/tópico específico da meta',
    example: 'Equações do 2º grau'
  })
  assunto: string;

  @ApiProperty({
    description: 'Tipo de estudo/atividade da meta',
    example: 'teoria',
    enum: ['teoria', 'questoes', 'revisao', 'reforco']
  })
  tipoEstudo: string;

  @ApiProperty({
    description: 'Comandos/instruções do mentor para a meta',
    example: 'Estude os conceitos fundamentais de equações do segundo grau. Foque na fórmula de Bhaskara e pratique a resolução de pelo menos 10 exercícios.',
    nullable: true
  })
  comandosMentor: string | null;

  @ApiProperty({
    description: 'Nível de relevância da meta (1-3)',
    example: 2,
    minimum: 1,
    maximum: 3
  })
  relevancia: number;

  @ApiProperty({
    description: 'Desempenho da meta (percentual de acertos)',
    example: 90.0,
    minimum: 0,
    maximum: 100
  })
  desempenho: number;
}
