import { PartialType } from '@nestjs/swagger';
import { CriarPlanoMestreDto } from './criarPlanoMestre.dto';

export class AtualizarPlanoMestreDto extends PartialType(CriarPlanoMestreDto) {}
