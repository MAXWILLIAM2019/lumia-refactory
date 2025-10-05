import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AtualizarAssuntoDto {
  @ApiPropertyOptional({
    description: 'Nome do assunto',
    example: 'Álgebra Linear',
  })
  @IsString()
  @IsOptional()
  nome?: string;
}

export class AtualizarDisciplinaDto {
  @ApiPropertyOptional({
    description: 'Nome da disciplina',
    example: 'Matemática',
  })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({
    description: 'Descrição da disciplina',
    example: 'Disciplina que abrange conceitos matemáticos fundamentais',
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({
    description: 'Indica se a disciplina está ativa',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  ativa?: boolean;

  @ApiPropertyOptional({
    description: 'Lista de assuntos da disciplina',
    type: [AtualizarAssuntoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AtualizarAssuntoDto)
  @IsOptional()
  assuntos?: AtualizarAssuntoDto[];
}
