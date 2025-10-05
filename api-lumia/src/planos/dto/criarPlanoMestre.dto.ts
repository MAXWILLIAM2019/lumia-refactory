import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CriarPlanoMestreDto {
  @ApiProperty({
    description: 'Nome do plano mestre',
    example: 'Plano de Estudos - Desenvolvedor Full Stack',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'Cargo alvo do plano',
    example: 'Desenvolvedor Full Stack',
  })
  @IsString()
  @IsNotEmpty()
  cargo: string;

  @ApiProperty({
    description: 'Descrição detalhada do plano',
    example: 'Plano completo para se tornar um desenvolvedor full stack com foco em React, Node.js e PostgreSQL',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    description: 'Duração estimada do plano em semanas',
    example: 24,
    minimum: 1,
    maximum: 104,
  })
  @IsNumber()
  @Min(1)
  @Max(104)
  duracaoSemanas: number;

  @ApiPropertyOptional({
    description: 'Nível de dificuldade do plano',
    example: 'Intermediário',
  })
  @IsString()
  @IsOptional()
  nivelDificuldade?: string;

  @ApiPropertyOptional({
    description: 'Tags para categorização do plano',
    example: ['frontend', 'backend', 'fullstack'],
  })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Pré-requisitos para o plano',
    example: 'Conhecimento básico em programação',
  })
  @IsString()
  @IsOptional()
  preRequisitos?: string;
}
