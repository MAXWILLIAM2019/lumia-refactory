import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO unificado para alteração de senha
 * Consolidado a partir de AlterarSenhaDto e AlterarSenhaAlunoDto
 */
export class AlterarSenhaDto {
  @ApiPropertyOptional({
    description: 'Senha atual do usuário (obrigatória apenas para usuários alterando a própria senha)',
    example: 'senhaAtual123',
  })
  @IsOptional()
  @IsString()
  senhaAtual?: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'novaSenha123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, {
    message: 'A nova senha deve ter pelo menos 6 caracteres',
  })
  novaSenha: string;
}
