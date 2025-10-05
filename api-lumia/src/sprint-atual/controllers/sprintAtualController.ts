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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServicoSprintAtual } from '../services/servicoSprintAtual';
import { AtualizarSprintAtualDto } from '../dto/atualizarSprintAtual.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

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
  async buscarSprintAtual(@Request() req: any): Promise<any> {
    // TODO: Implementar extração do ID do usuário do JWT quando reabilitado
    // const usuarioId = req.user.id;
    const usuarioId = 1; // Temporário para testes

    return await this.servicoSprintAtual.buscarSprintAtual(usuarioId);
  }

  @Put()
  @ApiOperation({ summary: 'Atualizar sprint atual do aluno' })
  @ApiResponse({ status: 200, description: 'Sprint atual atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 403, description: 'Sprint não pertence ao plano do usuário' })
  @ApiResponse({ status: 404, description: 'Sprint não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async atualizarSprintAtual(
    @Request() req: any,
    @Body() dadosAtualizacao: AtualizarSprintAtualDto,
  ): Promise<any> {
    // TODO: Implementar extração do ID do usuário do JWT quando reabilitado
    // const usuarioId = req.user.id;
    const usuarioId = 1; // Temporário para testes

    return await this.servicoSprintAtual.atualizarSprintAtual(usuarioId, dadosAtualizacao);
  }

  @Post('inicializar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inicializar sprint atual do aluno' })
  @ApiResponse({ status: 201, description: 'Sprint atual inicializada com sucesso' })
  @ApiResponse({ status: 400, description: 'Usuário já possui sprint atual' })
  @ApiResponse({ status: 404, description: 'Usuário não possui plano de estudo com sprints' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async inicializarSprintAtual(@Request() req: any): Promise<any> {
    // TODO: Implementar extração do ID do usuário do JWT quando reabilitado
    // const usuarioId = req.user.id;
    const usuarioId = 1; // Temporário para testes

    return await this.servicoSprintAtual.inicializarSprintAtual(usuarioId);
  }
}
