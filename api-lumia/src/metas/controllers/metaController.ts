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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServicoMeta } from '../services/servicoMeta';
import { CriarMetaMestreNovaDto } from '../dto/criarMetaMestre.dto';
import { AtualizarMetaMestreDto } from '../dto/atualizarMetaMestre.dto';
import { CriarMetaDto } from '../dto/criarMeta.dto';
import { AtualizarMetaInstanciaDto } from '../dto/atualizarMeta.dto';
import { ReordenarMetasDto } from '../dto/reordenarMetas.dto';
import { AdicionarMetasMestreDto } from '../dto/adicionarMetas.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';
import { MetaMestre } from '../entities/metaMestre.entity';
import { Meta } from '../entities/meta.entity';

@ApiTags('Metas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('metas')
export class MetaController {
  constructor(private readonly servicoMeta: ServicoMeta) {}

  @Post('mestre')
  @UseGuards(GuardAdministrador)
  @ApiOperation({
    summary: 'Criar meta mestre (Admin)',
    description: 'Cria uma nova meta mestre (template) para uma sprint mestre. Apenas administradores podem criar metas mestre.',
  })
  @ApiResponse({
    status: 201,
    description: 'Meta mestre criada com sucesso',
    type: MetaMestre,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou campos obrigatórios faltando',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
  })
  async criarMetaMestre(@Body() criarMetaMestreDto: CriarMetaMestreNovaDto): Promise<MetaMestre> {
    return await this.servicoMeta.criarMetaMestre(criarMetaMestreDto);
  }

  @Post('mestre/reordenar')
  @ApiOperation({
    summary: 'Reordenar metas mestre (Admin)',
    description: 'Reordena as metas mestre de uma sprint mestre alterando suas posições. Apenas administradores podem reordenar metas mestre.',
  })
  @ApiResponse({
    status: 200,
    description: 'Metas mestre reordenadas com sucesso',
    type: [MetaMestre],
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou metas não pertencem à sprint',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
  })
  async reordenarMetasMestre(@Body() reordenarMetasDto: ReordenarMetasDto): Promise<MetaMestre[]> {
    return await this.servicoMeta.reordenarMetasMestre(reordenarMetasDto);
  }

  @Post('instancia')
  @ApiOperation({
    summary: 'Criar meta instanciada (Aluno)',
    description: 'Cria uma nova meta (instância) para uma sprint. Apenas alunos podem criar metas instanciadas.',
  })
  @ApiResponse({
    status: 201,
    description: 'Meta instanciada criada com sucesso',
    type: Meta,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou campos obrigatórios faltando',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas alunos',
  })
  async criarMetaInstancia(@Body() criarMetaDto: CriarMetaDto): Promise<Meta> {
    return await this.servicoMeta.criarMetaInstancia(criarMetaDto);
  }

  @Post('instancia/reordenar')
  @ApiOperation({
    summary: 'Reordenar metas instanciadas (Aluno)',
    description: 'Reordena as metas instanciadas de uma sprint alterando suas posições. Apenas alunos podem reordenar metas instanciadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Metas instanciadas reordenadas com sucesso',
    type: [Meta],
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou metas não pertencem à sprint',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas alunos',
  })
  async reordenarMetas(@Body() reordenarMetasDto: ReordenarMetasDto): Promise<Meta[]> {
    return await this.servicoMeta.reordenarMetas(reordenarMetasDto);
  }

  @Put('mestre/:id')
  @UseGuards(GuardAdministrador)
  @ApiOperation({
    summary: 'Atualizar meta mestre (Admin)',
    description: 'Atualiza os dados de uma meta mestre existente. Apenas administradores podem atualizar metas mestre.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da meta mestre',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Meta mestre atualizada com sucesso',
    type: MetaMestre,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
  })
  @ApiResponse({
    status: 404,
    description: 'Meta mestre não encontrada',
  })
  async atualizarMetaMestre(
    @Param('id', ParseIntPipe) id: number,
    @Body() atualizarMetaMestreDto: AtualizarMetaMestreDto,
  ): Promise<MetaMestre> {
    return await this.servicoMeta.atualizarMetaMestre(id, atualizarMetaMestreDto);
  }

  @Put('instancia/:id')
  @ApiOperation({
    summary: 'Atualizar meta instanciada (Aluno)',
    description: 'Atualiza os dados de uma meta instanciada existente. Apenas alunos podem atualizar metas instanciadas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da meta instanciada',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Meta instanciada atualizada com sucesso',
    type: Meta,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas alunos',
  })
  @ApiResponse({
    status: 404,
    description: 'Meta instanciada não encontrada',
  })
  async atualizarMeta(
    @Param('id', ParseIntPipe) id: number,
    @Body() atualizarMetaDto: AtualizarMetaInstanciaDto,
  ): Promise<Meta> {
    return await this.servicoMeta.atualizarMeta(id, atualizarMetaDto);
  }

  @Get('mestre/:id')
  @ApiOperation({
    summary: 'Buscar meta mestre por ID',
    description: 'Retorna os detalhes de uma meta mestre específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da meta mestre',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Meta mestre encontrada com sucesso',
    type: MetaMestre,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 404,
    description: 'Meta mestre não encontrada',
  })
  async buscarMetaMestrePorId(@Param('id', ParseIntPipe) id: number): Promise<MetaMestre> {
    return await this.servicoMeta.buscarMetaMestrePorId(id);
  }

  @Get('instancia/:id')
  @ApiOperation({
    summary: 'Buscar meta instanciada por ID',
    description: 'Retorna os detalhes de uma meta instanciada específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da meta instanciada',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Meta instanciada encontrada com sucesso',
    type: Meta,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 404,
    description: 'Meta instanciada não encontrada',
  })
  async buscarMetaPorId(@Param('id', ParseIntPipe) id: number): Promise<Meta> {
    return await this.servicoMeta.buscarMetaPorId(id);
  }

  @Get('mestre/sprint/:sprintId')
  @ApiOperation({
    summary: 'Buscar metas mestre por sprint',
    description: 'Retorna todas as metas mestre de uma sprint mestre específica.',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'ID único da sprint mestre',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Metas mestre encontradas com sucesso',
    type: [MetaMestre],
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  async buscarMetasMestrePorSprint(@Param('sprintId', ParseIntPipe) sprintId: number): Promise<MetaMestre[]> {
    return await this.servicoMeta.buscarMetasMestrePorSprint(sprintId);
  }

  @Get('instancia/sprint/:sprintId')
  @ApiOperation({
    summary: 'Buscar metas instanciadas por sprint',
    description: 'Retorna todas as metas instanciadas de uma sprint específica.',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'ID único da sprint',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Metas instanciadas encontradas com sucesso',
    type: [Meta],
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  async buscarMetasPorSprint(@Param('sprintId', ParseIntPipe) sprintId: number): Promise<Meta[]> {
    return await this.servicoMeta.buscarMetasPorSprint(sprintId);
  }

  @Post('mestre/sprint/:sprintId/adicionar')
  @ApiOperation({
    summary: 'Adicionar metas mestre em lote (Admin)',
    description: 'Adiciona múltiplas metas mestre a uma sprint mestre existente. Apenas administradores podem adicionar metas mestre.',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'ID único da sprint mestre',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Metas mestre adicionadas com sucesso',
    type: [MetaMestre],
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou posições conflitantes',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint mestre não encontrada',
  })
  async adicionarMetasMestre(
    @Param('sprintId', ParseIntPipe) sprintId: number,
    @Body() adicionarMetasDto: AdicionarMetasMestreDto,
  ): Promise<MetaMestre[]> {
    return await this.servicoMeta.adicionarMetasMestre(sprintId, adicionarMetasDto);
  }

  @Delete('mestre/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir meta mestre (Admin)',
    description: 'Remove uma meta mestre existente. Apenas administradores podem excluir metas mestre.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da meta mestre',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Meta mestre excluída com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
  })
  @ApiResponse({
    status: 404,
    description: 'Meta mestre não encontrada',
  })
  async removerMetaMestre(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.servicoMeta.removerMetaMestre(id);
  }

  @Delete('instancia/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir meta instanciada (Aluno)',
    description: 'Remove uma meta instanciada existente. Apenas alunos podem excluir metas instanciadas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da meta instanciada',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Meta instanciada excluída com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas alunos',
  })
  @ApiResponse({
    status: 404,
    description: 'Meta instanciada não encontrada',
  })
  async removerMeta(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.servicoMeta.removerMeta(id);
  }
}
