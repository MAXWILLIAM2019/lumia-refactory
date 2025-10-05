import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, Min, Max, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoMeta } from '../../common/enums/tipoMeta.enum';

export class MetaMestreRequestDto {
  @ApiProperty({
    description: 'Nome da disciplina',
    example: 'JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  disciplina: string;

  @ApiProperty({
    description: 'Tipo da meta',
    enum: TipoMeta,
    example: TipoMeta.QUESTOES,
  })
  @IsEnum(TipoMeta)
  tipo: TipoMeta;

  @ApiProperty({
    description: 'Título da meta',
    example: 'Manipulação do DOM',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({
    description: 'Comandos ou instruções específicas para a meta',
    example: 'Criar interações dinâmicas com JavaScript',
  })
  @IsOptional()
  @IsString()
  comandos?: string;

  @ApiPropertyOptional({
    description: 'Link de referência para a meta',
    example: 'https://developer.mozilla.org/pt-BR/docs/Web/API/Document_Object_Model',
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
    description: 'Posição da meta na sprint',
    example: 3,
  })
  @IsInt()
  posicao: number;
}

export class AdicionarMetasMestreDto {
  @ApiProperty({
    description: 'Array de metas mestre para adicionar à sprint',
    type: [MetaMestreRequestDto],
    example: [
      {
        disciplina: 'JavaScript',
        tipo: 'questoes',
        titulo: 'Manipulação do DOM',
        comandos: 'Criar interações dinâmicas com JavaScript',
        link: 'https://developer.mozilla.org/pt-BR/docs/Web/API/Document_Object_Model',
        relevancia: 5,
        posicao: 3,
      },
      {
        disciplina: 'JavaScript',
        tipo: 'teoria',
        titulo: 'Eventos e Listeners',
        comandos: 'Implementar sistema de eventos em JavaScript',
        link: 'https://developer.mozilla.org/pt-BR/docs/Web/API/EventTarget/addEventListener',
        relevancia: 4,
        posicao: 4,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaMestreRequestDto)
  metas: MetaMestreRequestDto[];
}
