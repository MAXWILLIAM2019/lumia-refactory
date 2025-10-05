import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class RemoverAssociacaoDto {
  @ApiProperty({
    description: 'ID do usuário/aluno',
    example: 1,
  })
  @IsInt()
  idusuario: number;

  @ApiProperty({
    description: 'ID do plano',
    example: 1,
  })
  @IsInt()
  planoId: number;
}
