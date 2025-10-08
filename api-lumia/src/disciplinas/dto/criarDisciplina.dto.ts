import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CriarAssuntoDto {
  @ApiProperty({
    description: 'Nome do assunto',
    example: 'Álgebra Linear',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;
}

export class CriarDisciplinaDto {
  @ApiProperty({
    description: 'Nome da disciplina',
    example: 'Matemática',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({
    description: 'Descrição da disciplina',
    example: 'Disciplina que abrange conceitos matemáticos fundamentais',
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({
    description: 'Lista de assuntos da disciplina',
    type: [CriarAssuntoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriarAssuntoDto)
  @IsOptional()
  assuntos?: CriarAssuntoDto[];
}
