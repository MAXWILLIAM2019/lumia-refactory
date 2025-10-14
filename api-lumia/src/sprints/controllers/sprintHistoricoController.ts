import {
  Controller,
  Get,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ServicoSprintHistorico } from '../services/servicoSprintHistorico';
import { HistoricoSprintsResumoDto } from '../dto/historicoSprintsResumo.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';

interface RequestWithUser extends Request {
  user: Usuario;
}

@ApiTags('Histórico de Sprints')
@Controller('sprints/aluno')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SprintHistoricoController {
  constructor(private readonly servicoSprintHistorico: ServicoSprintHistorico) {}

  @Get('historico')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar resumo do histórico de sprints do aluno',
    description: 'Retorna informações organizadas sobre a sprint atual (em andamento), sprints pendentes e sprints finalizadas do aluno logado'
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de sprints retornado com sucesso',
    type: HistoricoSprintsResumoDto,
    schema: {
      example: {
        sprintAtual: {
          nomeSprint: 'Sprint 1 - Fundamentos do Sistema',
          cargoPlano: 'Analista',
          metaPendentes: 2,
          status: 'em andamento',
          progressoSprint: 33.33
        },
        sprintsPendentes: [
          { nomeSprint: 'Sprint 2 - Conceitos Avançados' },
          { nomeSprint: 'Sprint 3 - Especialização' }
        ],
        sprintsFinalizadas: [
          {
            nomeSprint: 'Sprint 1 - Fundamentos Básicos',
            cargoPlano: 'Analista',
            dataConclusaoSprint: '2025-10-15',
            statusSprint: 'concluida',
            progressoSprint: 100.00
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou expirado'
  })
  @ApiResponse({
    status: 404,
    description: 'Aluno não possui plano ativo'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor'
  })
  async buscarHistoricoSprints(@Request() req: RequestWithUser): Promise<HistoricoSprintsResumoDto> {
    const usuarioId = req.user.id;
    return await this.servicoSprintHistorico.buscarResumoHistoricoSprint(usuarioId);
  }
}
