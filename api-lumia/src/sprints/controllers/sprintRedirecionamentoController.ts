import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiExcludeController } from '@nestjs/swagger';
import { ServicoSprint } from '../services/servicoSprint';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Controlador de redirecionamento para compatibilidade com o frontend
 * 
 * @deprecated Este controlador será removido em versões futuras.
 * Atualize o frontend para usar os endpoints do módulo de sprints diretamente.
 */
@ApiExcludeController()
@Controller('sprints')
export class SprintRedirecionamentoController {
  constructor(private readonly servicoSprint: ServicoSprint) {}

  @Get()
  @Public()
  async listarSprints() {
    console.log('⚠️ Redirecionando GET /api/sprints para ServicoSprint.listarSprintsMestre');
    return await this.servicoSprint.listarSprintsMestre();
  }

  @Get(':id')
  @Public()
  async buscarSprintPorId(@Param('id', ParseIntPipe) id: number) {
    console.log(`⚠️ Redirecionando GET /api/sprints/${id} para ServicoSprint.buscarSprintMestrePorId`);
    return await this.servicoSprint.buscarSprintMestrePorId(id);
  }
}

