import {
  Controller,
  Get,
  Request,
  HttpStatus,
  HttpCode,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ServicoSprintHistorico } from '../services/servicoSprintHistorico';
import { HistoricoSprintsResumoDto } from '../dto/historicoSprintsResumo.dto';
import { DetalhesSprintResponseDto } from '../dto/detalhesSprintResponse.dto';
import { DetalhesMetaResponseDto } from '../dto/detalhesMetaResponse.dto';
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
          idSprint: 15,
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

  @Get('historico/detalhes/:sprintId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar detalhes completos de uma sprint específica',
    description: 'Retorna informações detalhadas de uma sprint organizada em 3 cards: resumo, metas e informações complementares. Usado quando o aluno clica em "visualizar" uma sprint no histórico.'
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da sprint retornados com sucesso',
    type: DetalhesSprintResponseDto,
    schema: {
      example: {
        cardResumo: {
          status: 'em andamento',
          nomeSprint: 'Sprint 1 - Fundamentos do Sistema',
          cargoPlano: 'Analista',
          desempenhoSprint: 87.5,
          metaPendentes: 2,
          totalMetas: 6,
          totalDisciplinas: 3,
          ultimaAtualizacao: '2025-10-15T14:30:00.000Z'
        },
        cardMetas: {
          listaMetas: [
            {
              idMeta: 123,
              nomeDisciplina: 'Matemática Básica'
            },
            {
              idMeta: 124,
              nomeDisciplina: 'Física Fundamental'
            }
          ]
        },
        cardComplemento: {
          progressoSprint: 33.33,
          dataInicio: '2025-10-09',
          dataFim: '2025-10-16',
          tempoMedioMeta: '00:45'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'ID da sprint inválido'
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou expirado'
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint não encontrada ou usuário não tem acesso'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor'
  })
  async buscarDetalhesSprint(
    @Param('sprintId') sprintId: string,
    @Request() req: RequestWithUser
  ): Promise<DetalhesSprintResponseDto> {
    const usuarioId = req.user.id;
    const sprintIdNumber = parseInt(sprintId, 10);

    if (isNaN(sprintIdNumber)) {
      throw new BadRequestException('ID da sprint deve ser um número válido');
    }

    return await this.servicoSprintHistorico.buscarDetalhesSprint(sprintIdNumber, usuarioId);
  }

  @Get('historico/detalhes/:sprintId/meta/:metaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar detalhes de uma meta específica dentro de uma sprint',
    description: 'Retorna informações detalhadas sobre uma meta específica dentro de uma sprint, incluindo desempenho e comandos do mentor. Usado quando o aluno clica em "ver detalhes" de uma meta.'
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da meta retornados com sucesso',
    type: DetalhesMetaResponseDto,
    schema: {
      example: {
        disciplina: 'Matemática Básica',
        status: 'Concluída',
        assunto: 'Equações do 2º grau',
        tipoEstudo: 'teoria',
        comandosMentor: 'Estude os conceitos fundamentais de equações do segundo grau. Foque na fórmula de Bhaskara e pratique a resolução de pelo menos 10 exercícios.',
        relevancia: 2,
        desempenho: 90.0
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'ID da sprint ou meta inválido'
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou expirado'
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint não encontrada, meta não encontrada, ou usuário não tem acesso'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor'
  })
  async buscarDetalhesMeta(
    @Param('sprintId') sprintId: string,
    @Param('metaId') metaId: string,
    @Request() req: RequestWithUser
  ): Promise<DetalhesMetaResponseDto> {
    const usuarioId = req.user.id;
    const sprintIdNumber = parseInt(sprintId, 10);
    const metaIdNumber = parseInt(metaId, 10);

    if (isNaN(sprintIdNumber)) {
      throw new BadRequestException('ID da sprint deve ser um número válido');
    }

    if (isNaN(metaIdNumber)) {
      throw new BadRequestException('ID da meta deve ser um número válido');
    }

    return await this.servicoSprintHistorico.buscarDetalhesMeta(sprintIdNumber, metaIdNumber, usuarioId);
  }
}
