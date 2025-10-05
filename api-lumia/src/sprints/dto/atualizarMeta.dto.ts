import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusMeta } from '../../common/enums/statusMeta.enum';

export class AtualizarMetaDto {
  @ApiPropertyOptional({
    description: 'Disciplina da meta',
    example: 'Matemática',
  })
  @IsString()
  @IsOptional()
  disciplina?: string;

  @ApiPropertyOptional({
    description: 'Tipo da meta',
    example: 'teoria',
    enum: ['teoria', 'questoes', 'revisao', 'reforco'],
  })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Título da meta',
    example: 'Álgebra Linear - Matrizes',
  })
  @IsString()
  @IsOptional()
  titulo?: string;

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
    description: 'Relevância da meta',
    example: 'Alta',
  })
  @IsString()
  @IsOptional()
  relevancia?: string;

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
