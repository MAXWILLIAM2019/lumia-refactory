import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AtualizarSprintAtualDto {
  @ApiProperty({
    description: 'ID da nova sprint atual',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  sprintId: number;
}
