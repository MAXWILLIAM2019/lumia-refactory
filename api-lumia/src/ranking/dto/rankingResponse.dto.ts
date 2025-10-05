import { ApiProperty } from '@nestjs/swagger';

export class RankingItemDto {
  @ApiProperty({
    description: 'Posição do aluno no ranking',
    example: 1,
  })
  posicao: number;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva Santos',
  })
  nome_usuario: string;

  @ApiProperty({
    description: 'Total de questões respondidas pelo usuário',
    example: 25,
  })
  total_questoes: number;

  @ApiProperty({
    description: 'Total de acertos do usuário',
    example: 20,
  })
  total_acertos: number;

  @ApiProperty({
    description: 'Percentual de acerto do usuário',
    example: 80.00,
  })
  percentual_acerto: number;

  @ApiProperty({
    description: 'Pontuação final calculada para o ranking',
    example: 85.50,
  })
  pontuacao_final: number;
}

export class RankingPaginationDto {
  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  pagina: number;

  @ApiProperty({
    description: 'Número de itens por página',
    example: 50,
  })
  limite: number;

  @ApiProperty({
    description: 'Total de alunos no ranking',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Total de páginas disponíveis',
    example: 3,
  })
  totalPaginas: number;

  @ApiProperty({
    description: 'Indica se existe próxima página',
    example: true,
  })
  temProxima: boolean;

  @ApiProperty({
    description: 'Indica se existe página anterior',
    example: false,
  })
  temAnterior: boolean;
}

export class RankingWeekDto {
  @ApiProperty({
    description: 'Data de início da semana do ranking (segunda-feira)',
    example: '2024-01-15',
  })
  inicio: string;

  @ApiProperty({
    description: 'Data de fim da semana do ranking (domingo)',
    example: '2024-01-21',
  })
  fim: string;
}

export class RankingResponseDto {
  @ApiProperty({
    description: 'Indica se a operação foi bem-sucedida',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem descritiva da operação',
    example: 'Ranking carregado com sucesso!',
  })
  message: string;

  @ApiProperty({
    description: 'Dados do ranking',
  })
  data: {
    ranking: RankingItemDto[];
    paginacao: RankingPaginationDto;
    semana: RankingWeekDto;
  };
}

export class MeuRankingResponseDto {
  @ApiProperty({
    description: 'Indica se a operação foi bem-sucedida',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Dados do ranking do usuário ou null se não estiver no ranking',
    nullable: true,
  })
  data: {
    posicao: RankingItemDto;
    semana: RankingWeekDto;
  } | null;

  @ApiProperty({
    description: 'Mensagem descritiva (apenas quando data é null)',
    example: 'Usuário não encontrado no ranking desta semana',
    required: false,
  })
  message?: string;
}
