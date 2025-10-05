import { PartialType } from '@nestjs/swagger';
import { CriarPlanoDto } from './criarPlano.dto';

export class AtualizarPlanoDto extends PartialType(CriarPlanoDto) {}
