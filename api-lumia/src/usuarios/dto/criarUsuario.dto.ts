import { IsString, IsEmail, IsOptional, IsBoolean, MinLength, MaxLength, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CriarUsuarioDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva Santos',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome: string;

  @ApiProperty({
    description: 'Email do usuário (será usado como login)',
    example: 'joao.silva@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'CPF do usuário (aceita com ou sem formatação - pontos e hífen serão removidos automaticamente)',
    example: '12345678900',
    minLength: 11,
    maxLength: 14,
  })
  @IsString()
  @MinLength(11)
  @MaxLength(14)
  cpf: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento do usuário (opcional)',
    example: '1990-01-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de nascimento deve estar no formato YYYY-MM-DD' })
  dataNascimento?: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: '123456',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({
    description: 'Grupo do usuário',
    example: 'aluno',
    enum: ['aluno', 'administrador'],
  })
  @IsString()
  @IsIn(['aluno', 'administrador'])
  grupo: string;
}
