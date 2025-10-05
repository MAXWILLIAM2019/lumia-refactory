import { IsNumber, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssociarAlunoPlanoDto {
  @ApiProperty({
    description: 'ID do aluno',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  alunoId: number;

  @ApiProperty({
    description: 'ID do plano',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  planoId: number;

  @ApiPropertyOptional({
    description: 'Data de início da associação',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @ApiPropertyOptional({
    description: 'Data de conclusão esperada',
    example: '2024-07-15',
  })
  @IsDateString()
  @IsOptional()
  dataConclusaoEsperada?: string;

  @ApiPropertyOptional({
    description: 'Observações sobre a associação',
    example: 'Aluno iniciou com conhecimento prévio em React',
  })
  @IsOptional()
  observacoes?: string;
}
