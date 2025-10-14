import { ApiProperty } from '@nestjs/swagger';
import { SprintDetalhesResumoDto } from './sprintDetalhesResumo.dto';
import { SprintDetalhesMetasDto } from './sprintDetalhesMetas.dto';
import { SprintDetalhesComplementoDto } from './sprintDetalhesComplemento.dto';

/**
 * DTO de resposta para os detalhes completos de uma sprint
 * Organiza os dados em 3 cards estruturais para consumo pelo frontend
 */
export class DetalhesSprintResponseDto {
  @ApiProperty({
    description: 'Card com informações principais e status da sprint',
    type: SprintDetalhesResumoDto
  })
  cardResumo: SprintDetalhesResumoDto;

  @ApiProperty({
    description: 'Card com lista de metas e suas respectivas disciplinas',
    type: SprintDetalhesMetasDto
  })
  cardMetas: SprintDetalhesMetasDto;

  @ApiProperty({
    description: 'Card com informações complementares (datas e métricas)',
    type: SprintDetalhesComplementoDto
  })
  cardComplemento: SprintDetalhesComplementoDto;
}
