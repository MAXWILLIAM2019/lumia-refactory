import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsDateString, IsString, IsOptional, IsIn, Min, Max } from 'class-validator';

export class AtribuirPlanoAlunoDto {
  @ApiProperty({
    description: 'ID do usuário/aluno',
    example: 1,
  })
  @IsInt()
  idusuario: number;

  @ApiProperty({
    description: 'ID do plano a ser atribuído',
    example: 1,
  })
  @IsInt()
  planoId: number;

  @ApiPropertyOptional({
    description: 'Data de início do plano (opcional, default: data atual)',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({
    description: 'Data prevista de término do plano (opcional, calculada automaticamente se não fornecida)',
    example: '2024-04-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dataPrevisaoTermino?: string;

  @ApiPropertyOptional({
    description: 'Status inicial do plano',
    enum: ['não iniciado', 'em andamento', 'concluído', 'cancelado'],
    example: 'não iniciado',
  })
  @IsOptional()
  @IsString()
  @IsIn(['não iniciado', 'em andamento', 'concluído', 'cancelado'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Observações sobre a atribuição do plano',
    example: 'Plano atribuído pelo administrador',
  })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
