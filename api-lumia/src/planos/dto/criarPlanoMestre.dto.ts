import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para criação de plano mestre
 * 
 * Este DTO foi alinhado com a estrutura atual do banco de dados,
 * contendo apenas os campos que existem na tabela PlanosMestre.
 */
export class CriarPlanoMestreDto {
  @ApiProperty({
    description: 'Nome do plano mestre',
    example: 'Plano de Estudos - INSS Analista',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'Cargo alvo do plano',
    example: 'Analista de Seguro Social',
  })
  @IsString()
  @IsNotEmpty()
  cargo: string;

  @ApiProperty({
    description: 'Descrição detalhada do plano',
    example: 'Plano completo para aprovação no concurso do INSS para o cargo de Analista de Seguro Social',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    description: 'Duração estimada do plano em semanas',
    example: 24,
    minimum: 1,
    maximum: 104,
  })
  @IsNumber()
  @Min(1)
  @Max(104)
  duracao: number;
}
