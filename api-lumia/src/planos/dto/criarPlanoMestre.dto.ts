import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional, IsArray, ArrayMinSize, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para criação de plano mestre
 * 
 * Este DTO foi alinhado com a estrutura atual do banco de dados,
 * contendo apenas os campos que existem na tabela PlanosMestre.
 */
export class CriarPlanoMestreDto {
  @ApiProperty({
    description: 'Nome do plano mestre',
    example: 'Plano de Estudos - INSS Analista',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'Cargo alvo do plano',
    example: 'Analista de Seguro Social',
  })
  @IsString()
  @IsNotEmpty()
  cargo: string;

  @ApiProperty({
    description: 'Descrição detalhada do plano',
    example: 'Plano completo para aprovação no concurso do INSS para o cargo de Analista de Seguro Social',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiPropertyOptional({
    description: 'Duração estimada do plano em semanas (opcional)',
    example: 24,
    minimum: 1,
    maximum: 104,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(104)
  duracao?: number;

  @ApiProperty({
    description: 'IDs das disciplinas que farão parte do plano mestre (obrigatório)',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'O plano mestre deve ter pelo menos uma disciplina' })
  @IsInt({ each: true, message: 'Cada ID de disciplina deve ser um número inteiro' })
  disciplinaIds: number[];
}
