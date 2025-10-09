import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CriarMetaMestreDto {
  @ApiProperty({
    description: 'Código único da disciplina',
    example: 'MATE20853',
  })
  @IsString()
  @IsNotEmpty()
  codigoDisciplina: string;

  @ApiProperty({
    description: 'Tipo da meta (ex: teoria, questões, revisão, reforço, simulado)',
    example: 'teoria',
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    description: 'Código único do assunto',
    example: 'MATEXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  codigoAssunto: string;

  @ApiPropertyOptional({
    description: 'Comandos/instruções da meta',
    example: 'Estude os capítulos 1-3 e resolva os exercícios propostos',
  })
  @IsString()
  @IsOptional()
  comandos?: string;

  @ApiPropertyOptional({
    description: 'Link para material de estudo',
    example: 'https://exemplo.com/material',
  })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty({
    description: 'Relevância da meta (1-3)',
    example: 3,
    minimum: 1,
    maximum: 3,
  })
  @IsNumber()
  @Min(1)
  @Max(3)
  relevancia: number;

  @ApiPropertyOptional({
    description: 'Posição da meta na sprint',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  posicao?: number;
}

export class CriarSprintMestreDto {
  @ApiProperty({
    description: 'Nome da sprint mestre',
    example: 'Sprint 1 - Fundamentos',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'ID do plano mestre',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  planoId: number;

  @ApiPropertyOptional({
    description: 'Data de início da sprint (opcional para templates)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @ApiPropertyOptional({
    description: 'Data de fim da sprint (opcional para templates)',
    example: '2024-01-22',
  })
  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @ApiPropertyOptional({
    description: 'Lista de metas mestre da sprint',
    type: [CriarMetaMestreDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriarMetaMestreDto)
  @IsOptional()
  metas?: CriarMetaMestreDto[];
}
