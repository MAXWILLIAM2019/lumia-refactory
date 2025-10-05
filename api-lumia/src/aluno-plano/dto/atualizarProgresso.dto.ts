import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsDateString, IsString, IsOptional, IsIn, Min, Max } from 'class-validator';

export class AtualizarProgressoDto {
  @ApiProperty({
    description: 'ID do usuário/aluno',
    example: 1,
  })
  @IsInt()
  idusuario: number;

  @ApiProperty({
    description: 'ID do plano',
    example: 1,
  })
  @IsInt()
  planoId: number;

  @ApiPropertyOptional({
    description: 'Percentual de progresso no plano (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progresso?: number;

  @ApiPropertyOptional({
    description: 'Status atual do plano',
    enum: ['não iniciado', 'em andamento', 'concluído', 'cancelado'],
    example: 'em andamento',
  })
  @IsOptional()
  @IsString()
  @IsIn(['não iniciado', 'em andamento', 'concluído', 'cancelado'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Data de conclusão do plano (definida automaticamente se status = concluído)',
    example: '2024-04-10T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dataConclusao?: string;

  @ApiPropertyOptional({
    description: 'Observações sobre o progresso',
    example: 'Aluno com excelente desempenho',
  })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
