import { ApiProperty } from '@nestjs/swagger';
import { MetaDisciplinaDto } from './metaDisciplina.dto';

/**
 * DTO para o card de metas dos detalhes da sprint
 * Contém a lista de metas com suas respectivas disciplinas
 */
export class SprintDetalhesMetasDto {
  @ApiProperty({
    description: 'Lista de metas da sprint com suas disciplinas',
    type: [MetaDisciplinaDto],
    example: [
      {
        idMeta: 123,
        nomeDisciplina: 'Matemática Básica'
      },
      {
        idMeta: 124,
        nomeDisciplina: 'Física Fundamental'
      }
    ]
  })
  listaMetas: MetaDisciplinaDto[];
}
