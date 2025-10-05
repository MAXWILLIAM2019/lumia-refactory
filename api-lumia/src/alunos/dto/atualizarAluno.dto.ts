import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, Matches } from 'class-validator';

export class AtualizarAlunoDto {
  @ApiPropertyOptional({
    description: 'Nome completo do aluno',
    example: 'João Silva Santos',
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({
    description: 'Email do aluno (deve ser único)',
    example: 'joao.silva@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefone do aluno (formato brasileiro)',
    example: '(11) 99999-9999',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX',
  })
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Biografia do aluno',
    example: 'Estudante de programação apaixonado por tecnologia',
  })
  @IsOptional()
  @IsString()
  biografia?: string;

  @ApiPropertyOptional({
    description: 'Formação acadêmica do aluno',
    example: 'Ciência da Computação - Universidade XYZ',
  })
  @IsOptional()
  @IsString()
  formacao?: string;

  @ApiPropertyOptional({
    description: 'Se o aluno está trabalhando atualmente',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isTrabalhando?: boolean;

  @ApiPropertyOptional({
    description: 'Se o aluno aceita os termos de uso',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isAceitaTermos?: boolean;
}
