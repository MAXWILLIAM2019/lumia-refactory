import { IsArray, ValidateNested, IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdicionarMetaDto {
  @ApiProperty({
    description: 'Código único da disciplina',
    example: 'MATE20853',
  })
  @IsString()
  @IsNotEmpty()
  codigoDisciplina: string;

  @ApiProperty({
    description: 'Tipo da meta',
    example: 'teoria',
    enum: ['teoria', 'questoes', 'revisao', 'reforco'],
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
