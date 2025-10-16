import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para aluno no dashboard administrativo
 * Contém informações básicas do aluno para listagem
 */
export class AlunoDashboardDto {
  @ApiProperty({
    description: 'ID único do aluno',
    example: 1
  })
  idAluno: number;

  @ApiProperty({
    description: 'Nome completo do aluno',
    example: 'João Silva Santos'
  })
  nomeAluno: string;

  @ApiProperty({
    description: 'Email do aluno (usado como login)',
    example: 'joao.silva@email.com'
  })
  emailAluno: string;

  @ApiProperty({
    description: 'CPF do aluno',
    example: '12345678901',
    nullable: true
  })
  cpfAluno: string | null;

  @ApiProperty({
    description: 'Nome do plano ativo/atual do aluno',
    example: 'Plano de Estudos - Desenvolvimento Full Stack',
    nullable: true
  })
  planoAtivo: string | null;

  @ApiProperty({
    description: 'Data de cadastro do aluno no sistema (formato YYYY-MM-DD)',
    example: '2025-01-15'
  })
  dataCadastro: string;

  @ApiProperty({
    description: 'Status do aluno (ativo/inativo) baseado na situação do usuário',
    example: 'ativo',
    enum: ['ativo', 'inativo']
  })
  status: string;
}

/**
 * DTO de resposta para listagem de alunos no dashboard
 * Contém array de alunos com informações paginadas
 */
export class AlunosDashboardDto {
  @ApiProperty({
    description: 'Lista de alunos',
    type: [AlunoDashboardDto]
  })
  alunos: AlunoDashboardDto[];

  @ApiProperty({
    description: 'Informações de paginação',
    example: {
      pagina: 1,
      limite: 10,
      total: 25,
      totalPaginas: 3
    }
  })
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}
