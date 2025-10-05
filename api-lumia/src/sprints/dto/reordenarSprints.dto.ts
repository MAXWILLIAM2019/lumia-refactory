import { IsNumber, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReordenarSprintsDto {
  @ApiProperty({
    description: 'ID do plano mestre',
    example: 1,
  })
  @IsNumber()
  planoId: number;

  @ApiProperty({
    description: 'Array com os IDs das sprints na nova ordem',
    example: [3, 1, 2],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  ordemSprints: number[];
}
