import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength, Matches, IsDateString } from 'class-validator';

export class CriarAlunoDto {
  @ApiProperty({
    description: 'Nome completo do aluno',
    example: 'João Silva Santos',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'Email do aluno (deve ser único)',
    example: 'joao.silva@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'CPF do aluno (aceita com ou sem formatação - pontos e hífen serão removidos automaticamente)',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, {
    message: 'CPF deve conter exatamente 11 dígitos numéricos',
  })
  cpf: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento do aluno (opcional)',
    example: '1990-01-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de nascimento deve estar no formato YYYY-MM-DD' })
  dataNascimento?: string;

  @ApiProperty({
    description: 'Senha do aluno',
    example: 'minhasenha123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, {
    message: 'Senha deve ter pelo menos 6 caracteres',
  })
  senha: string;
}
