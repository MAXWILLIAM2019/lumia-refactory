import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CriarAssuntoVersaoDto {
  @ApiProperty({
    description: 'Nome do assunto',
    example: 'Álgebra Linear',
  })
  @IsString()
  nome: string;
}

export class CriarVersaoDisciplinaDto {
  @ApiProperty({
    description: 'Nome da nova versão da disciplina',
    example: 'Matemática Avançada',
  })
  @IsString()
  nome: string;

  @ApiPropertyOptional({
    description: 'Descrição da nova versão da disciplina',
    example: 'Versão atualizada com novos conceitos matemáticos',
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({
    description: 'Indica se a disciplina está ativa',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  ativa?: boolean;

  @ApiPropertyOptional({
    description: 'Lista de assuntos da nova versão',
    type: [CriarAssuntoVersaoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriarAssuntoVersaoDto)
  @IsOptional()
  assuntos?: CriarAssuntoVersaoDto[];

  @ApiPropertyOptional({
    description: 'Se deve copiar os assuntos da versão anterior',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  copiarAssuntos?: boolean;
}
