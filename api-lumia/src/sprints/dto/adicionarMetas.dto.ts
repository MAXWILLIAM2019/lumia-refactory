import { IsArray, ValidateNested, IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdicionarMetaDto {
  @ApiProperty({
    description: 'Disciplina da meta',
    example: 'Matemática',
  })
  @IsString()
  @IsNotEmpty()
  disciplina: string;

  @ApiProperty({
    description: 'Tipo da meta',
    example: 'teoria',
    enum: ['teoria', 'questoes', 'revisao', 'reforco'],
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    description: 'Título da meta',
    example: 'Álgebra Linear - Matrizes',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

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
    description: 'Relevância da meta',
    example: 'Alta',
  })
  @IsString()
  @IsNotEmpty()
  relevancia: string;

  @ApiProperty({
    description: 'Posição da meta na sprint',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  posicao: number;
}

export class AdicionarMetasDto {
  @ApiProperty({
    description: 'Lista de metas a serem adicionadas',
    type: [AdicionarMetaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdicionarMetaDto)
  metas: AdicionarMetaDto[];
}
