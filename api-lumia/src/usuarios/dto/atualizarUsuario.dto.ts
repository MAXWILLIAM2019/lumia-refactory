import { IsString, IsEmail, IsOptional, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AtualizarUsuarioDto {
  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'João Silva Santos',
    minLength: 2,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome?: string;

  @ApiPropertyOptional({
    description: 'Email do usuário',
    example: 'joao.silva@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefone do usuário (formato brasileiro)',
    example: '(11) 99999-9999',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX',
  })
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Biografia do usuário',
    example: 'Estudante de desenvolvimento web com foco em React e Node.js',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  biografia?: string;

  @ApiPropertyOptional({
    description: 'Formação do usuário',
    example: 'ensino-superior-completo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  formacao?: string;

  @ApiPropertyOptional({
    description: 'Se o usuário está trabalhando',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isTrabalhando?: boolean;

  @ApiPropertyOptional({
    description: 'Se o usuário aceita os termos',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isAceitaTermos?: boolean;
}
