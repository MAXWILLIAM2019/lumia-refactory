import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsDateString, IsString, IsOptional } from 'class-validator';

export class CriarInstanciaDto {
  @ApiProperty({
    description: 'ID do plano mestre que será instanciado',
    example: 1,
    type: Number
  })
  @IsInt()
  planoMestreId: number;

  @ApiProperty({
    description: 'ID do usuário/aluno que receberá a instância personalizada',
    example: 1,
    type: Number
  })
  @IsInt()
  idUsuario: number;

  @ApiPropertyOptional({
    description: 'Data de início do plano personalizado (padrão: data atual)',
    example: '2024-01-15',
    type: String
  })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({
    description: 'Status inicial do plano personalizado',
    example: 'não iniciado',
    enum: ['não iniciado', 'em andamento', 'concluído', 'cancelado'],
    type: String
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Observações sobre a criação da instância',
    example: 'Plano personalizado criado a partir do template de Desenvolvimento Web',
    type: String
  })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
