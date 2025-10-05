import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class AssociarDisciplinaPlanoDto {
  @ApiProperty({
    description: 'IDs das disciplinas a serem associadas ao plano',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'É necessário fornecer pelo menos uma disciplina' })
  @IsInt({ each: true })
  disciplinaIds: number[];
}


