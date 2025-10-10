import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ServicoPlano } from '../services/servicoPlano';
import { StatusPlano } from '../../common/enums/statusPlano.enum';

@ApiTags('Planos - Aluno')
@Controller('planos/aluno')
export class PlanoAlunoController {
  constructor(private readonly servicoPlano: ServicoPlano) {}

  // ===== ENDPOINTS PARA PLANOS DO ALUNO =====

  @Get(':alunoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar planos atribuídos a um aluno específico' })
  @ApiParam({ name: 'alunoId', description: 'ID do aluno', type: Number })
  @ApiResponse({ status: 200, description: 'Planos do aluno retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async listarPlanosDoAluno(@Param('alunoId', ParseIntPipe) alunoId: number) {
    return await this.servicoPlano.listarPlanosDoAluno(alunoId);
  }

  @Get('logado/:alunoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar plano ativo do aluno logado' })
  @ApiParam({ name: 'alunoId', description: 'ID do aluno', type: Number })
  @ApiResponse({ status: 200, description: 'Plano do aluno retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Aluno não possui planos atribuídos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async buscarPlanoDoAlunoLogado(@Param('alunoId', ParseIntPipe) alunoId: number) {
    return await this.servicoPlano.buscarPlanoDoAlunoLogado(alunoId);
  }

  @Put(':alunoId/plano/:planoId/progresso')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar progresso do aluno no plano' })
  @ApiParam({ name: 'alunoId', description: 'ID do aluno', type: Number })
  @ApiParam({ name: 'planoId', description: 'ID do plano', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        progresso: { type: 'number', description: 'Progresso em porcentagem (0-100)' },
        status: { type: 'string', enum: ['não iniciado', 'em andamento', 'concluído', 'cancelado'] },
        observacoes: { type: 'string', description: 'Observações sobre o progresso' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Progresso atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Associação não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async atualizarProgressoAluno(
    @Param('alunoId', ParseIntPipe) alunoId: number,
    @Param('planoId', ParseIntPipe) planoId: number,
    @Body() dadosProgresso: { progresso?: number; status?: StatusPlano; observacoes?: string },
  ) {
    return await this.servicoPlano.atualizarProgressoAluno(alunoId, planoId, dadosProgresso);
  }

  @Delete(':alunoId/plano/:planoId')
  @UseGuards(GuardAdministrador)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover associação entre aluno e plano' })
  @ApiParam({ name: 'alunoId', description: 'ID do aluno', type: Number })
  @ApiParam({ name: 'planoId', description: 'ID do plano', type: Number })
  @ApiResponse({ status: 204, description: 'Associação removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Associação não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async removerAssociacaoAlunoPlano(
    @Param('alunoId', ParseIntPipe) alunoId: number,
    @Param('planoId', ParseIntPipe) planoId: number,
  ) {
    await this.servicoPlano.removerAssociacaoAlunoPlano(alunoId, planoId);
  }
}
