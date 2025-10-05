import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { TipoMeta } from '../../common/enums/tipoMeta.enum';
import { StatusMeta } from '../../common/enums/statusMeta.enum';

export class AtualizarMetaInstanciaDto {
  @ApiPropertyOptional({
    description: 'Nome da disciplina',
    example: 'HTML',
  })
  @IsOptional()
  @IsString()
  disciplina?: string;

  @ApiPropertyOptional({
    description: 'Tipo da meta',
    enum: TipoMeta,
    example: TipoMeta.TEORIA,
  })
  @IsOptional()
  @IsEnum(TipoMeta)
  tipo?: TipoMeta;

  @ApiPropertyOptional({
    description: 'Título da meta',
    example: 'Estrutura básica do HTML - Atualizada',
  })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Comandos ou instruções específicas para a meta',
    example: 'Criar página HTML com estrutura básica e semântica',
  })
  @IsOptional()
  @IsString()
  comandos?: string;

  @ApiPropertyOptional({
    description: 'Link de referência para a meta',
    example: 'https://developer.mozilla.org/pt-BR/docs/Web/HTML',
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({
    description: 'Nível de relevância da meta (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  relevancia?: number;

  @ApiPropertyOptional({
    description: 'Tempo estudado (formato HH:MM)',
    example: '02:30',
  })
  @IsOptional()
  @IsString()
  tempoEstudado?: string;

  @ApiPropertyOptional({
    description: 'Performance na meta (0-100)',
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  desempenho?: number;

  @ApiPropertyOptional({
    description: 'Status da meta',
    enum: StatusMeta,
    example: StatusMeta.CONCLUIDA,
  })
  @IsOptional()
  @IsEnum(StatusMeta)
  status?: StatusMeta;

  @ApiPropertyOptional({
    description: 'Total de questões respondidas',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  totalQuestoes?: number;

  @ApiPropertyOptional({
    description: 'Número de questões corretas',
    example: 8,
  })
  @IsOptional()
  @IsInt()
  questoesCorretas?: number;
}
