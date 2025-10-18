import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
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

  @ApiProperty({
    description: 'Lista de assuntos da disciplina (obrigatório - uma disciplina deve ter pelo menos um assunto)',
    type: [CriarAssuntoDto],
    example: [
      { "nome": "Álgebra Linear" },
      { "nome": "Geometria Analítica" }
    ]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'A disciplina deve ter pelo menos um assunto' })
  @ValidateNested({ each: true })
  @Type(() => CriarAssuntoDto)
  assuntos: CriarAssuntoDto[];
}
