import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ArrayMinSize } from 'class-validator';

export class ReordenarMetasDto {
  @ApiProperty({
    description: 'ID da sprint à qual as metas pertencem',
    example: 1,
  })
  @IsInt()
  sprintId: number;

  @ApiProperty({
    description: 'Array com a nova ordem dos IDs das metas',
    example: [2, 3, 1],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ordemMetas: number[];
}
