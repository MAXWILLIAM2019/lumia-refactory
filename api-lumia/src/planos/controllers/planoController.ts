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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServicoPlano } from '../services/servicoPlano';
import { CriarPlanoMestreDto } from '../dto/criarPlanoMestre.dto';
import { AtualizarPlanoMestreDto } from '../dto/atualizarPlanoMestre.dto';
import { CriarPlanoDto } from '../dto/criarPlano.dto';
import { AtualizarPlanoDto } from '../dto/atualizarPlano.dto';
import { AssociarAlunoPlanoDto } from '../dto/associarAlunoPlano.dto';
import { AssociarDisciplinaPlanoMestreDto } from '../dto/associarDisciplinaPlanoMestre.dto';
import { CriarInstanciaDto } from '../dto/criarInstancia.dto';
import { StatusPlano } from '../../common/enums/statusPlano.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';

@ApiTags('Planos')
@Controller('planos-mestre')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlanoController {
  constructor(private readonly servicoPlano: ServicoPlano) {}

  // ===== ENDPOINTS PARA PLANO MESTRE (TEMPLATES) =====

  @Post('mestre')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Criar novo plano mestre (template)' })
  @ApiResponse({ status: 201, description: 'Plano mestre criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async criarPlanoMestre(@Body() dadosPlanoMestre: CriarPlanoMestreDto) {
    return await this.servicoPlano.criarPlanoMestre(dadosPlanoMestre);
  }

  @Get('mestre')
  @ApiOperation({ summary: 'Listar todos os planos mestre (templates)' })
  @ApiResponse({ status: 200, description: 'Lista de planos mestre retornada com sucesso' })
  async listarPlanosMestre() {
    return await this.servicoPlano.listarPlanosMestre();
  }

  @Get('mestre/:id')
  @ApiOperation({ summary: 'Buscar plano mestre por ID' })
  @ApiParam({ name: 'id', description: 'ID do plano mestre', type: Number })
  @ApiResponse({ status: 200, description: 'Plano mestre encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Plano mestre não encontrado' })
  async buscarPlanoMestrePorId(@Param('id', ParseIntPipe) id: number) {
    return await this.servicoPlano.buscarPlanoMestrePorId(id);
  }

  @Put('mestre/:id')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Atualizar plano mestre' })
  @ApiParam({ name: 'id', description: 'ID do plano mestre', type: Number })
  @ApiResponse({ status: 200, description: 'Plano mestre atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Plano mestre não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async atualizarPlanoMestre(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosAtualizacao: AtualizarPlanoMestreDto,
  ) {
    return await this.servicoPlano.atualizarPlanoMestre(id, dadosAtualizacao);
  }

  @Delete('mestre/:planoMestreId/disciplinas/:disciplinaId')
  @UseGuards(JwtAuthGuard, GuardAdministrador)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover disciplina de um plano mestre',
    description: 'Remove a associação entre uma disciplina e um plano mestre'
  })
  @ApiParam({
    name: 'planoMestreId',
    description: 'ID do plano mestre',
    example: 1
  })
  @ApiParam({
    name: 'disciplinaId',
    description: 'ID da disciplina a ser removida',
    example: 2
  })
  @ApiResponse({ status: 200, description: 'Disciplina removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  @ApiResponse({ status: 404, description: 'Associação não encontrada' })
  @HttpCode(HttpStatus.OK)
  async removerDisciplinaDoPlanoMestre(
    @Param('planoMestreId', ParseIntPipe) planoMestreId: number,
    @Param('disciplinaId', ParseIntPipe) disciplinaId: number,
  ) {
    await this.servicoPlano.removerDisciplinaDoPlanoMestre(planoMestreId, disciplinaId);
    return { message: 'Disciplina removida do plano mestre com sucesso' };
  }

  @Delete('mestre/:id')
  @UseGuards(GuardAdministrador)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar plano mestre (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID do plano mestre', type: Number })
  @ApiResponse({ status: 204, description: 'Plano mestre desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Plano mestre não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async desativarPlanoMestre(@Param('id', ParseIntPipe) id: number) {
    await this.servicoPlano.desativarPlanoMestre(id);
  }

  @Post('criar-instancia')
  @UseGuards(GuardAdministrador)
  @ApiOperation({
    summary: 'Criar instância personalizada de plano mestre',
    description: 'Cria uma instância personalizada de um plano mestre para um aluno específico. Transforma templates em planos de estudo reais.'
  })
  @ApiResponse({
    status: 201,
    description: 'Instância criada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Instância criada com sucesso' },
        plano: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            nome: { type: 'string', example: 'Plano de Desenvolvimento Web Frontend' },
            templateOrigemId: { type: 'number', example: 1 },
            totalSprints: { type: 'number', example: 3 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou campos obrigatórios faltando' })
  @ApiResponse({ status: 401, description: 'Token inválido ou não fornecido' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  @ApiResponse({ status: 404, description: 'Plano mestre não encontrado' })
  async criarInstanciaPlano(@Body() dados: CriarInstanciaDto) {
    return await this.servicoPlano.criarInstanciaPlano(dados);
  }

  // ===== ENDPOINTS PARA PLANO (INSTÂNCIAS) =====

  @Post()
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Criar novo plano (instância)' })
  @ApiResponse({ status: 201, description: 'Plano criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Plano mestre ou aluno não encontrado' })
  @ApiResponse({ status: 409, description: 'Aluno já possui um plano ativo' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async criarPlano(@Body() dadosPlano: CriarPlanoDto) {
    return await this.servicoPlano.criarPlano(dadosPlano);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os planos (instâncias)' })
  @ApiResponse({ status: 200, description: 'Lista de planos retornada com sucesso' })
  async listarPlanos() {
    return await this.servicoPlano.listarPlanos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar plano por ID' })
  @ApiParam({ name: 'id', description: 'ID do plano', type: Number })
  @ApiResponse({ status: 200, description: 'Plano encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async buscarPlanoPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.servicoPlano.buscarPlanoPorId(id);
  }

  @Put(':id')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Atualizar plano' })
  @ApiParam({ name: 'id', description: 'ID do plano', type: Number })
  @ApiResponse({ status: 200, description: 'Plano atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async atualizarPlano(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosAtualizacao: AtualizarPlanoDto,
  ) {
    return await this.servicoPlano.atualizarPlano(id, dadosAtualizacao);
  }

  @Put(':id/status')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Alterar status do plano' })
  @ApiParam({ name: 'id', description: 'ID do plano', type: Number })
  @ApiQuery({ name: 'status', enum: StatusPlano, description: 'Novo status do plano' })
  @ApiResponse({ status: 200, description: 'Status do plano alterado com sucesso' })
  @ApiResponse({ status: 400, description: 'Status inválido' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async alterarStatusPlano(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: StatusPlano,
  ) {
    return await this.servicoPlano.alterarStatusPlano(id, status);
  }

  // ===== ENDPOINTS PARA ASSOCIAÇÃO ALUNO-PLANO =====

  @Post('associar')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Associar aluno a um plano' })
  @ApiResponse({ status: 201, description: 'Aluno associado ao plano com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Aluno ou plano não encontrado' })
  @ApiResponse({ status: 409, description: 'Aluno já está associado a este plano' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async associarAlunoPlano(@Body() dadosAssociacao: AssociarAlunoPlanoDto) {
    return await this.servicoPlano.associarAlunoPlano(dadosAssociacao);
  }

  @Get('aluno/:alunoId')
  @ApiOperation({ summary: 'Listar planos de um aluno específico' })
  @ApiParam({ name: 'alunoId', description: 'ID do aluno', type: Number })
  @ApiResponse({ status: 200, description: 'Planos do aluno retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  async listarPlanosDoAluno(@Param('alunoId', ParseIntPipe) alunoId: number) {
    return await this.servicoPlano.listarPlanosDoAluno(alunoId);
  }

  @Delete('aluno/:alunoId/plano/:planoId')
  @UseGuards(GuardAdministrador)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover associação aluno-plano' })
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

  // ===== ENDPOINTS ESPECÍFICOS DO SISTEMA =====

  @Get('aluno-logado/:alunoId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar plano do aluno logado' })
  @ApiParam({ name: 'alunoId', description: 'ID do aluno', type: Number })
  @ApiResponse({ status: 200, description: 'Plano do aluno retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Aluno não possui planos atribuídos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async buscarPlanoDoAlunoLogado(@Param('alunoId', ParseIntPipe) alunoId: number) {
    return await this.servicoPlano.buscarPlanoDoAlunoLogado(alunoId);
  }

  @Put('aluno/:alunoId/plano/:planoId/progresso')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar progresso do aluno no plano' })
  @ApiParam({ name: 'alunoId', description: 'ID do aluno', type: Number })
  @ApiParam({ name: 'planoId', description: 'ID do plano', type: Number })
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

  // ===== ENDPOINTS DE ESTATÍSTICAS =====

  @Get('estatisticas/geral')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Obter estatísticas gerais dos planos' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async obterEstatisticasPlanos() {
    return await this.servicoPlano.obterEstatisticasPlanos();
  }


  // ===== ENDPOINTS PARA PLANOS MESTRE =====

  @Post('mestre/:planoMestreId/associar-disciplinas')
  @UseGuards(JwtAuthGuard, GuardAdministrador)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Associar disciplinas a um plano mestre',
    description: 'Define quais disciplinas são permitidas em um plano mestre. Isso permite criar sprints com essas disciplinas.'
  })
  @ApiParam({
    name: 'planoMestreId',
    description: 'ID do plano mestre',
    example: 1
  })
  @ApiResponse({ status: 200, description: 'Disciplinas associadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  @ApiResponse({ status: 404, description: 'Plano mestre não encontrado' })
  @HttpCode(HttpStatus.OK)
  async associarDisciplinasAoPlanoMestre(
    @Param('planoMestreId', ParseIntPipe) planoMestreId: number,
    @Body() dados: AssociarDisciplinaPlanoMestreDto,
  ) {
    await this.servicoPlano.associarDisciplinasAoPlanoMestre(planoMestreId, dados.disciplinaIds);
    return { message: 'Disciplinas associadas ao plano mestre com sucesso' };
  }

  @Get('mestre/:planoMestreId/disciplinas')
  @UseGuards(JwtAuthGuard, GuardAdministrador)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar disciplinas de um plano mestre',
    description: 'Retorna todas as disciplinas associadas a um plano mestre'
  })
  @ApiParam({
    name: 'planoMestreId',
    description: 'ID do plano mestre',
    example: 1
  })
  @ApiResponse({ status: 200, description: 'Lista de disciplinas retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  @ApiResponse({ status: 404, description: 'Plano mestre não encontrado' })
  async listarDisciplinasDoPlanoMestre(
    @Param('planoMestreId', ParseIntPipe) planoMestreId: number,
  ) {
    const disciplinas = await this.servicoPlano.listarDisciplinasDoPlanoMestre(planoMestreId);
    return { disciplinas };
  }

}
