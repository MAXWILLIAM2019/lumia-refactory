import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { TipoMeta } from '../../common/enums/tipoMeta.enum';

export class CriarMetaMestreNovaDto {
  @ApiProperty({
    description: 'Nome da disciplina',
    example: 'HTML',
  })
  @IsString()
  @IsNotEmpty()
  disciplina: string;

  @ApiProperty({
    description: 'Tipo da meta (ex: teoria, questões, revisão, reforço, simulado)',
    example: 'teoria',
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    description: 'Assunto da meta',
    example: 'Estrutura básica do HTML',
  })
  @IsString()
  @IsNotEmpty()
  assunto: string;

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
    description: 'ID da sprint mestre à qual a meta pertence',
    example: 1,
  })
  @IsInt()
  sprintId: number;
}
