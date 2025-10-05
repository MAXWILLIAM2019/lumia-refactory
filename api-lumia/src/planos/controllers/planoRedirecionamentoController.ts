import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiExcludeController } from '@nestjs/swagger';
import { ServicoPlano } from '../services/servicoPlano';
import { CriarPlanoDto } from '../dto/criarPlano.dto';
import { AtualizarPlanoDto } from '../dto/atualizarPlano.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Controlador de redirecionamento para compatibilidade com o frontend
 * 
 * @deprecated Este controlador será removido em versões futuras.
 * Atualize o frontend para usar os endpoints do módulo de planos diretamente.
 */
@ApiExcludeController()
@Controller('planos')
export class PlanoRedirecionamentoController {
  constructor(private readonly servicoPlano: ServicoPlano) {}

  @Get()
  @Public()
  async listarPlanos() {
    console.log('⚠️ Redirecionando GET /api/planos para ServicoPlano.listarPlanos');
    return await this.servicoPlano.listarPlanos();
  }

  @Get(':id')
  @Public()
  async buscarPlanoPorId(@Param('id', ParseIntPipe) id: number) {
    console.log(`⚠️ Redirecionando GET /api/planos/${id} para ServicoPlano.buscarPlanoPorId`);
    return await this.servicoPlano.buscarPlanoPorId(id);
  }

  @Post()
  @Public()
  async criarPlano(@Body() dadosPlano: CriarPlanoDto) {
    console.log('⚠️ Redirecionando POST /api/planos para ServicoPlano.criarPlano');
    return await this.servicoPlano.criarPlano(dadosPlano);
  }
}

