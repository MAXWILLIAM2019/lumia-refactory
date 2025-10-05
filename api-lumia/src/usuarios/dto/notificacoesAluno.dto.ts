import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para configurações de notificações específicas de alunos
 * 
 * IMPORTANTE: Este DTO é específico para o perfil de ALUNO.
 * Futuramente, outros perfis (como administradores, mentores, etc.) terão
 * seus próprios DTOs de notificações com parâmetros diferentes.
 */
export class NotificacoesAlunoDto {
  @ApiPropertyOptional({
    description: 'Receber notificações sobre novidades da plataforma',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  novidadesPlataforma?: boolean;

  @ApiPropertyOptional({
    description: 'Receber notificações sobre mensagens do mentor',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  mensagensMentor?: boolean;

  @ApiPropertyOptional({
    description: 'Receber notificações sobre novo material',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  novoMaterial?: boolean;

  @ApiPropertyOptional({
    description: 'Receber notificações sobre atividades e simulados',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  atividadesSimulados?: boolean;

  @ApiPropertyOptional({
    description: 'Receber notificações sobre mentorias',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  mentorias?: boolean;
}


