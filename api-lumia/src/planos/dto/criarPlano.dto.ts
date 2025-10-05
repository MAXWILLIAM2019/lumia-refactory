import { IsNumber, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CriarPlanoDto {
  @ApiProperty({
    description: 'ID do plano mestre (template)',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  planoMestreId: number;

  @ApiProperty({
    description: 'ID do aluno que receberá o plano',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  alunoId: number;

  @ApiPropertyOptional({
    description: 'Data de início personalizada do plano',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @ApiPropertyOptional({
    description: 'Data de conclusão esperada do plano',
    example: '2024-07-15',
  })
  @IsDateString()
  @IsOptional()
  dataConclusaoEsperada?: string;

  @ApiPropertyOptional({
    description: 'Observações específicas para este plano',
    example: 'Plano personalizado para aluno com experiência em frontend',
  })
  @IsOptional()
  observacoes?: string;
}
