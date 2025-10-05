import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength, Matches } from 'class-validator';

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
    description: 'CPF do aluno (deve ser único)',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, {
    message: 'CPF deve conter exatamente 11 dígitos numéricos',
  })
  cpf: string;

  @ApiPropertyOptional({
    description: 'Senha do aluno (opcional - se não fornecida, será gerada automaticamente)',
    example: 'minhasenha123',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, {
    message: 'Senha deve ter pelo menos 6 caracteres',
  })
  senha?: string;
}
