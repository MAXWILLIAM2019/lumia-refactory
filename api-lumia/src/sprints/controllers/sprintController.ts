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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ServicoSprint } from '../services/servicoSprint';
import { CriarSprintMestreDto } from '../dto/criarSprintMestre.dto';
import { AtualizarSprintMestreDto } from '../dto/atualizarSprintMestre.dto';
import { AtualizarMetaDto } from '../dto/atualizarMeta.dto';
import { ReordenarSprintsDto } from '../dto/reordenarSprints.dto';
import { AdicionarMetasDto } from '../dto/adicionarMetas.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sprints')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('sprints')
export class SprintController {
  constructor(private readonly servicoSprint: ServicoSprint) {}

  // ===== ENDPOINTS PARA SPRINT MESTRE (TEMPLATES) =====

  @Post('mestre')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Criar nova Sprint Mestre (template)' })
  @ApiResponse({ status: 201, description: 'Sprint Mestre criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Plano mestre não encontrado' })
  async criarSprintMestre(@Body() dadosSprint: CriarSprintMestreDto) {
    return await this.servicoSprint.criarSprintMestre(dadosSprint);
  }

  @Get('mestre')
  @ApiOperation({ summary: 'Listar todas as Sprints Mestre' })
  @ApiResponse({ status: 200, description: 'Lista de Sprints Mestre retornada com sucesso' })
  async listarSprintsMestre() {
    return await this.servicoSprint.listarSprintsMestre();
  }

  @Get('mestre/:id')
  @ApiOperation({ summary: 'Buscar Sprint Mestre por ID' })
  @ApiParam({ name: 'id', description: 'ID da Sprint Mestre', type: Number })
  @ApiResponse({ status: 200, description: 'Sprint Mestre encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Sprint Mestre não encontrada' })
  async buscarSprintMestrePorId(@Param('id', ParseIntPipe) id: number) {
    return await this.servicoSprint.buscarSprintMestrePorId(id);
  }

  @Put('mestre/:id')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Atualizar Sprint Mestre' })
  @ApiParam({ name: 'id', description: 'ID da Sprint Mestre', type: Number })
  @ApiResponse({ status: 200, description: 'Sprint Mestre atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Sprint Mestre não encontrada' })
  async atualizarSprintMestre(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosAtualizacao: AtualizarSprintMestreDto,
  ) {
    return await this.servicoSprint.atualizarSprintMestre(id, dadosAtualizacao);
  }

  @Delete('mestre/:id')
  @UseGuards(GuardAdministrador)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover Sprint Mestre' })
  @ApiParam({ name: 'id', description: 'ID da Sprint Mestre', type: Number })
  @ApiResponse({ status: 204, description: 'Sprint Mestre removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Sprint Mestre não encontrada' })
  async removerSprintMestre(@Param('id', ParseIntPipe) id: number) {
    await this.servicoSprint.removerSprintMestre(id);
  }

  @Put('mestre/reordenar')
  @ApiOperation({ summary: 'Reordenar Sprints Mestre de um plano' })
  @ApiResponse({ status: 200, description: 'Sprints reordenadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Plano mestre não encontrado' })
  async reordenarSprints(@Body() dadosReordenacao: ReordenarSprintsDto) {
    return await this.servicoSprint.reordenarSprints(dadosReordenacao);
  }

  @Post('mestre/:id/metas')
  @ApiOperation({ summary: 'Adicionar metas a uma Sprint Mestre' })
  @ApiParam({ name: 'id', description: 'ID da Sprint Mestre', type: Number })
  @ApiResponse({ status: 201, description: 'Metas adicionadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou posições conflitantes' })
  @ApiResponse({ status: 404, description: 'Sprint Mestre não encontrada' })
  async adicionarMetas(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosMetas: AdicionarMetasDto,
  ) {
    return await this.servicoSprint.adicionarMetas(id, dadosMetas);
  }

  // ===== ENDPOINTS PARA META MESTRE =====

  @Put('meta-mestre/:id')
  @ApiOperation({ summary: 'Atualizar Meta Mestre' })
  @ApiParam({ name: 'id', description: 'ID da Meta Mestre', type: Number })
  @ApiResponse({ status: 200, description: 'Meta Mestre atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Meta Mestre não encontrada' })
  async atualizarMetaMestre(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosAtualizacao: AtualizarMetaDto,
  ) {
    return await this.servicoSprint.atualizarMetaMestre(id, dadosAtualizacao);
  }

  // ===== ENDPOINTS PARA META (INSTÂNCIA) =====

  @Put('meta/:id')
  @ApiOperation({
    summary: 'Atualizar Meta instanciada',
    description: 'Atualiza uma meta. Se tempoEstudado, totalQuestoes e questoesCorretas forem fornecidos juntos, calcula automaticamente o desempenho e marca a meta como concluída.'
  })
  @ApiParam({ name: 'id', description: 'ID da Meta', type: Number })
  @ApiResponse({ status: 200, description: 'Meta atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Meta não encontrada' })
  async atualizarMetaInstancia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosAtualizacao: AtualizarMetaDto,
  ) {
    return await this.servicoSprint.atualizarMetaInstancia(id, dadosAtualizacao);
  }

  // ===== ENDPOINTS PARA SPRINT (INSTÂNCIA) =====

  @Get('plano/:planoId')
  @ApiOperation({ summary: 'Buscar sprints instanciadas de um plano' })
  @ApiParam({ name: 'planoId', description: 'ID do plano', type: Number })
  @ApiResponse({ status: 200, description: 'Sprints do plano retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async buscarSprintsInstanciadasPorPlano(@Param('planoId', ParseIntPipe) planoId: number) {
    return await this.servicoSprint.buscarSprintsInstanciadasPorPlano(planoId);
  }
}
