import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServicoSprintAtual } from '../services/servicoSprintAtual';
import { AtualizarSprintAtualDto } from '../dto/atualizarSprintAtual.dto';
import { MetricasSprintDto } from '../dto/metricasSprint.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Usuario } from '../../usuarios/entities/usuario.entity';

interface RequestWithUser extends ExpressRequest {
  user: Usuario;
}

@ApiTags('Sprint Atual')
@Controller('sprint-atual')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SprintAtualController {
  constructor(private readonly servicoSprintAtual: ServicoSprintAtual) {}

  @Get()
  @ApiOperation({ summary: 'Buscar sprint atual do aluno' })
  @ApiResponse({ status: 200, description: 'Sprint atual encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não possui plano de estudo com sprints' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async buscarSprintAtual(@Request() req: RequestWithUser): Promise<any> {
    const usuarioId = req.user.id;

    return await this.servicoSprintAtual.buscarSprintAtual(usuarioId);
  }

  @Get('metricas')
  @ApiOperation({
    summary: 'Obter métricas da sprint atual',
    description: 'Retorna estatísticas calculadas da sprint atual do aluno, incluindo desempenho médio, horas estudadas, progresso e outras métricas agregadas'
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas calculadas com sucesso',
    type: MetricasSprintDto
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não possui sprint atual com metas'
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido'
  })
  async obterMetricasSprintAtual(@Request() req: RequestWithUser): Promise<MetricasSprintDto> {
    const usuarioId = req.user.id;

    return await this.servicoSprintAtual.calcularMetricasSprintAtual(usuarioId);
  }

  @Put()
  @ApiOperation({ summary: 'Atualizar sprint atual do aluno' })
  @ApiResponse({ status: 200, description: 'Sprint atual atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 403, description: 'Sprint não pertence ao plano do usuário' })
  @ApiResponse({ status: 404, description: 'Sprint não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async atualizarSprintAtual(
    @Request() req: RequestWithUser,
    @Body() dadosAtualizacao: AtualizarSprintAtualDto,
  ): Promise<any> {
    const usuarioId = req.user.id;

    return await this.servicoSprintAtual.atualizarSprintAtual(usuarioId, dadosAtualizacao);
  }

  @Post('inicializar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inicializar sprint atual do aluno' })
  @ApiResponse({ status: 201, description: 'Sprint atual inicializada com sucesso' })
  @ApiResponse({ status: 400, description: 'Usuário já possui sprint atual' })
  @ApiResponse({ status: 404, description: 'Usuário não possui plano de estudo com sprints' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async inicializarSprintAtual(@Request() req: RequestWithUser): Promise<any> {
    const usuarioId = req.user.id;

    return await this.servicoSprintAtual.inicializarSprintAtual(usuarioId);
  }
}
