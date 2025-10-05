import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { TipoMeta } from '../../common/enums/tipoMeta.enum';

export class CriarMetaDto {
  @ApiProperty({
    description: 'Nome da disciplina',
    example: 'HTML',
  })
  @IsString()
  @IsNotEmpty()
  disciplina: string;

  @ApiProperty({
    description: 'Tipo da meta',
    enum: TipoMeta,
    example: TipoMeta.TEORIA,
  })
  @IsEnum(TipoMeta)
  tipo: TipoMeta;

  @ApiProperty({
    description: 'Título da meta',
    example: 'Estrutura básica do HTML',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({
    description: 'Comandos ou instruções específicas para a meta',
    example: 'Criar página HTML com estrutura básica',
  })
  @IsOptional()
  @IsString()
  comandos?: string;

  @ApiPropertyOptional({
    description: 'Link de referência para a meta',
    example: 'https://developer.mozilla.org/pt-BR/docs/Web/HTML',
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({
    description: 'Nível de relevância da meta (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  relevancia: number;

  @ApiProperty({
    description: 'ID da sprint à qual a meta pertence',
    example: 1,
  })
  @IsInt()
  sprintId: number;
}
