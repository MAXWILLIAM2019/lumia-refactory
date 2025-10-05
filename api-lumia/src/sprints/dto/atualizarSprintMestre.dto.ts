import { PartialType } from '@nestjs/swagger';
import { CriarSprintMestreDto } from './criarSprintMestre.dto';

export class AtualizarSprintMestreDto extends PartialType(CriarSprintMestreDto) {}
