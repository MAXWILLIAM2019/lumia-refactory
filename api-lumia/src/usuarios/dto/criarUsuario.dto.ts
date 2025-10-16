import { IsString, IsEmail, IsOptional, IsBoolean, MinLength, MaxLength, IsIn, IsDateString, IsNumber } from 'class-validator';
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

/**
 * DTO para cadastro completo de usuário com associação opcional de plano
 * Garante atomicidade quando plano é associado
 *
 * REGRAS DE NEGÓCIO:
 * - CPF e Email devem ser únicos
 * - CPF é limpo automaticamente (remove pontos e hífen)
 * - Data de nascimento é opcional
 * - Senha é obrigatória e criptografada
 * - Se planoMestreId + associarPlano = true: cria instância personalizada + associa atomicamente
 * - Um aluno pode ter apenas UM plano ativo por vez
 * - Plano anterior ativo é automaticamente desabilitado
 * - Aluno NÃO pode ter vínculo com instâncias do mesmo plano mestre
 *
 * CASOS DE USO:
 * 1. Cadastro básico: associarPlano = false ou omitido
 * 2. Cadastro + plano: associarPlano = true + planoMestreId válido
 * 3. Conflito: CPF/Email duplicado → erro
 * 4. Substituição: aluno com plano ativo → desabilita antigo, ativa novo
 * 5. Vínculo duplicado: aluno já teve instância deste plano mestre → erro
 *
 * ATOMICIDADE:
 * - Tudo ou nada: usuário + aluno_info + plano (se solicitado)
 * - Rollback automático se qualquer operação falhar
 */
export class CadastroCompletoDto {
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
    example: 'minhasenha123',
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

  @ApiPropertyOptional({
    description: 'ID do plano mestre para criar instância personalizada (opcional)',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'planoMestreId deve ser um número' })
  planoMestreId?: number;

  @ApiPropertyOptional({
    description: 'Se true, cria instância do plano mestre e associa automaticamente ao aluno (requer planoMestreId)',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'associarPlano deve ser true ou false' })
  associarPlano?: boolean;
}
