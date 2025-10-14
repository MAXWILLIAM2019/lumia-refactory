import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para representar uma meta com sua disciplina
 * Usado na lista de metas do cardMetas
 */
export class MetaDisciplinaDto {
  @ApiProperty({
    description: 'ID da meta',
    example: 123
  })
  idMeta: number;

  @ApiProperty({
    description: 'Nome da disciplina da meta',
    example: 'Matemática Básica'
  })
  nomeDisciplina: string;
}
