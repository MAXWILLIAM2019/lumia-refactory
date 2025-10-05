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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServicoDisciplina } from '../services/servicoDisciplina';
import { CriarDisciplinaDto } from '../dto/criarDisciplina.dto';
import { AtualizarDisciplinaDto } from '../dto/atualizarDisciplina.dto';
import { CriarVersaoDisciplinaDto } from '../dto/criarVersaoDisciplina.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';

@ApiTags('Disciplinas')
@Controller('disciplinas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DisciplinaController {
  constructor(private readonly servicoDisciplina: ServicoDisciplina) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as disciplinas' })
  @ApiResponse({ status: 200, description: 'Lista de disciplinas retornada com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async listarDisciplinas(): Promise<any> {
    return await this.servicoDisciplina.listarDisciplinas();
  }

  @Get('ativas')
  @ApiOperation({ summary: 'Listar apenas disciplinas ativas' })
  @ApiResponse({ status: 200, description: 'Lista de disciplinas ativas retornada com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async listarDisciplinasAtivas(): Promise<any> {
    return await this.servicoDisciplina.listarDisciplinasAtivas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar disciplina por ID' })
  @ApiParam({ name: 'id', description: 'ID da disciplina', type: 'number' })
  @ApiResponse({ status: 200, description: 'Disciplina encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Disciplina não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async buscarDisciplina(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.servicoDisciplina.buscarDisciplinaPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova disciplina' })
  @ApiResponse({ status: 201, description: 'Disciplina criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 409, description: 'Já existe uma disciplina com este nome' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  @UseGuards(GuardAdministrador)
  async criarDisciplina(@Body() dadosDisciplina: CriarDisciplinaDto): Promise<any> {
    return await this.servicoDisciplina.criarDisciplina(dadosDisciplina);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar disciplina existente' })
  @ApiParam({ name: 'id', description: 'ID da disciplina', type: 'number' })
  @ApiResponse({ status: 200, description: 'Disciplina atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Disciplina não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 409, description: 'Já existe outra disciplina com este nome' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  @UseGuards(GuardAdministrador)
  async atualizarDisciplina(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosAtualizacao: AtualizarDisciplinaDto,
  ): Promise<any> {
    return await this.servicoDisciplina.atualizarDisciplina(id, dadosAtualizacao);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover disciplina' })
  @ApiParam({ name: 'id', description: 'ID da disciplina', type: 'number' })
  @ApiResponse({ status: 204, description: 'Disciplina removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Disciplina não encontrada' })
  @ApiResponse({ status: 400, description: 'Não é possível remover disciplina em uso' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  @UseGuards(GuardAdministrador)
  async removerDisciplina(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.servicoDisciplina.removerDisciplina(id);
  }

  @Post(':id/versoes')
  @ApiOperation({ summary: 'Criar nova versão de disciplina' })
  @ApiParam({ name: 'id', description: 'ID da disciplina original', type: 'number' })
  @ApiResponse({ status: 201, description: 'Nova versão da disciplina criada com sucesso' })
  @ApiResponse({ status: 404, description: 'Disciplina original não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  @UseGuards(GuardAdministrador)
  async criarVersaoDisciplina(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosVersao: CriarVersaoDisciplinaDto,
  ): Promise<any> {
    return await this.servicoDisciplina.criarVersaoDisciplina(id, dadosVersao);
  }

  @Get(':id/versoes')
  @ApiOperation({ summary: 'Listar todas as versões de uma disciplina' })
  @ApiParam({ name: 'id', description: 'ID da disciplina', type: 'number' })
  @ApiResponse({ status: 200, description: 'Lista de versões retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Disciplina não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async listarVersoesDisciplina(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.servicoDisciplina.listarVersoesDisciplina(id);
  }

  @Get(':id1/comparar/:id2')
  @ApiOperation({ summary: 'Comparar duas versões de uma disciplina' })
  @ApiParam({ name: 'id1', description: 'ID da primeira versão', type: 'number' })
  @ApiParam({ name: 'id2', description: 'ID da segunda versão', type: 'number' })
  @ApiResponse({ status: 200, description: 'Comparação realizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Uma ou ambas as disciplinas não foram encontradas' })
  @ApiResponse({ status: 400, description: 'As disciplinas não são versões da mesma disciplina original' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async compararVersoesDisciplina(
    @Param('id1', ParseIntPipe) id1: number,
    @Param('id2', ParseIntPipe) id2: number,
  ): Promise<any> {
    return await this.servicoDisciplina.compararVersoesDisciplina(id1, id2);
  }
}
