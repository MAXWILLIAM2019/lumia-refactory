import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusMeta } from '../../common/enums/statusMeta.enum';

export class AtualizarMetaDto {
  @ApiPropertyOptional({
    description: 'Código único da disciplina',
    example: 'MATE20853',
  })
  @IsString()
  @IsOptional()
  codigoDisciplina?: string;

  @ApiPropertyOptional({
    description: 'Tipo da meta',
    example: 'teoria',
    enum: ['teoria', 'questoes', 'revisao', 'reforco'],
  })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Código único do assunto',
    example: 'MATEXXXXX',
  })
  @IsString()
  @IsOptional()
  codigoAssunto?: string;

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

  @ApiPropertyOptional({
    description: 'Relevância da meta (1-3)',
    example: 3,
    minimum: 1,
    maximum: 3,
  })
  @IsNumber()
  @Min(1)
  @Max(3)
  @IsOptional()
  relevancia?: number;

  @ApiPropertyOptional({
    description: 'Tempo estudado na meta',
    example: '02:30',
  })
  @IsString()
  @IsOptional()
  tempoEstudado?: string;

  @ApiPropertyOptional({
    description: 'Desempenho na meta (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  desempenho?: number;

  @ApiPropertyOptional({
    description: 'Status da meta',
    enum: StatusMeta,
    example: StatusMeta.CONCLUIDA,
  })
  @IsEnum(StatusMeta)
  @IsOptional()
  status?: StatusMeta;

  @ApiPropertyOptional({
    description: 'Total de questões da meta',
    example: 20,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  totalQuestoes?: number;

  @ApiPropertyOptional({
    description: 'Questões corretas da meta',
    example: 17,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  questoesCorretas?: number;
}
