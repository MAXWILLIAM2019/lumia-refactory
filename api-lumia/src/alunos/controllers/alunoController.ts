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
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServicoAluno } from '../services/servicoAluno';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Controlador específico para funcionalidades de domínio de alunos
 * 
 * Este controlador contém apenas endpoints específicos do domínio de alunos,
 * como gerenciamento de planos, sprints e métricas.
 * 
 * As operações CRUD básicas de alunos foram consolidadas no módulo de usuários.
 */
@ApiTags('Funcionalidades de Alunos')
@Controller('alunos-funcionalidades')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlunoController {
  constructor(private readonly servicoAluno: ServicoAluno) {}

  // Rota de teste removida conforme solicitado

  @Get('sprints')
  @ApiOperation({
    summary: 'Listar sprints do aluno autenticado',
    description: 'Retorna todas as sprints associadas ao aluno autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sprints obtida com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Aluno não encontrado ou não possui sprints',
  })
  async listarSprintsDoAluno(@Req() req: any) {
    const idUsuario = req.user?.id;
    return await this.servicoAluno.listarSprintsDoAluno(idUsuario);
  }

  // Aqui você adicionaria outros endpoints específicos do domínio de alunos
  // como métricas, progresso, etc.
}
