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
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiExcludeController } from '@nestjs/swagger';
import { ServicoDisciplina } from '../services/servicoDisciplina';
import { CriarDisciplinaDto } from '../dto/criarDisciplina.dto';
import { AtualizarDisciplinaDto } from '../dto/atualizarDisciplina.dto';
import { CriarVersaoDisciplinaDto } from '../dto/criarVersaoDisciplina.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Controlador de redirecionamento para compatibilidade com o frontend
 * 
 * @deprecated Este controlador será removido em versões futuras.
 * Atualize o frontend para usar os endpoints do módulo de disciplinas diretamente.
 */
@ApiExcludeController()
@Controller('disciplinas')
export class DisciplinaRedirecionamentoController {
  constructor(private readonly servicoDisciplina: ServicoDisciplina) {}

  @Get()
  @Public()
  async listarDisciplinas(): Promise<any> {
    console.log('⚠️ Redirecionando GET /api/disciplinas para ServicoDisciplina.listarDisciplinas');
    return await this.servicoDisciplina.listarDisciplinas();
  }

  @Get('ativas')
  @Public()
  async listarDisciplinasAtivas(): Promise<any> {
    console.log('⚠️ Redirecionando GET /api/disciplinas/ativas para ServicoDisciplina.listarDisciplinasAtivas');
    return await this.servicoDisciplina.listarDisciplinasAtivas();
  }

  @Get(':id')
  @Public()
  async buscarDisciplina(@Param('id', ParseIntPipe) id: number): Promise<any> {
    console.log(`⚠️ Redirecionando GET /api/disciplinas/${id} para ServicoDisciplina.buscarDisciplinaPorId`);
    return await this.servicoDisciplina.buscarDisciplinaPorId(id);
  }
}

