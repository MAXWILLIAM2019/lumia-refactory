import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AtualizarAssuntoDto {
  @ApiPropertyOptional({
    description: 'ID do assunto (para atualização de assunto existente)',
    example: 1,
  })
  @IsOptional()
  id?: number;

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
    description: 'Lista de assuntos da disciplina. ' +
    'Assuntos com ID são atualizados, assuntos sem ID são criados. ' +
    'NUNCA remove assuntos existentes para preservar integridade referencial.',
    type: [AtualizarAssuntoDto],
    example: [
      { "id": 1, "nome": "Álgebra Linear Atualizada" },  // Atualiza existente
      { "nome": "Cálculo Diferencial" }  // Cria novo
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AtualizarAssuntoDto)
  @IsOptional()
  assuntos?: AtualizarAssuntoDto[];
}
