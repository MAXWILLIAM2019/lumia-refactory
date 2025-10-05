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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServicoAlunoPlano } from '../services/servicoAlunoPlano';
import { AtribuirPlanoAlunoDto } from '../dto/atribuirPlanoAluno.dto';
import { AtualizarProgressoDto } from '../dto/atualizarProgresso.dto';
import { RemoverAssociacaoDto } from '../dto/removerAssociacao.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';
import { AlunoPlano } from '../entities/alunoPlano.entity';

@ApiTags('Aluno-Plano')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('aluno-plano')
export class AlunoPlanoController {
  constructor(private readonly servicoAlunoPlano: ServicoAlunoPlano) {}

  @Get('test')
  @ApiOperation({
    summary: 'Testar conexão do módulo de aluno-plano',
    description: 'Endpoint de teste para verificar se o módulo de associações aluno-plano está funcionando corretamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulo funcionando corretamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Rota de aluno-plano funcionando!',
        },
      },
    },
  })
  async testarConexao() {
    return { message: 'Rota de aluno-plano funcionando!' };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as associações aluno-plano',
    description: 'Retorna todas as associações entre alunos e planos do sistema, incluindo dados do usuário e do plano',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de associações obtida com sucesso',
    type: [AlunoPlano],
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async listarAssociacoes(): Promise<AlunoPlano[]> {
    return await this.servicoAlunoPlano.listarAssociacoes();
  }

  @Post()
  @UseGuards(GuardAdministrador)
  @ApiOperation({
    summary: 'Atribuir plano a um aluno',
    description: 'Cria uma nova associação entre um aluno e um plano. Se o aluno já tiver um plano ativo, o anterior será cancelado automaticamente.',
  })
  @ApiResponse({
    status: 201,
    description: 'Plano atribuído com sucesso',
    type: AlunoPlano,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou campos obrigatórios faltando',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário ou plano não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async atribuirPlanoAluno(@Body() atribuirPlanoAlunoDto: AtribuirPlanoAlunoDto): Promise<AlunoPlano> {
    return await this.servicoAlunoPlano.atribuirPlanoAluno(atribuirPlanoAlunoDto);
  }

  @Get('meu-plano')
  @ApiOperation({
    summary: 'Buscar plano do aluno logado',
    description: 'Retorna o plano ativo associado ao aluno autenticado, incluindo sprints e metas',
  })
  @ApiResponse({
    status: 200,
    description: 'Plano do aluno obtido com sucesso',
    type: AlunoPlano,
  })
  @ApiResponse({
    status: 404,
    description: 'Aluno não possui planos atribuídos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async buscarPlanoDoAlunoLogado(@Request() req): Promise<AlunoPlano> {
    const idUsuario = req.user?.id;
    return await this.servicoAlunoPlano.buscarPlanoDoAlunoLogado(idUsuario);
  }

  @Get('aluno/:alunoId')
  @ApiOperation({
    summary: 'Buscar planos de um aluno específico',
    description: 'Retorna todos os planos associados a um aluno específico, incluindo histórico de planos',
  })
  @ApiParam({
    name: 'alunoId',
    description: 'ID do aluno',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Planos do aluno obtidos com sucesso',
    type: [AlunoPlano],
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async buscarPlanosPorAluno(@Param('alunoId', ParseIntPipe) alunoId: number): Promise<AlunoPlano[]> {
    return await this.servicoAlunoPlano.buscarPlanosPorAluno(alunoId);
  }

  @Get('plano/:planoId')
  @ApiOperation({
    summary: 'Buscar alunos de um plano específico',
    description: 'Retorna todos os alunos associados a um plano específico, incluindo dados de progresso',
  })
  @ApiParam({
    name: 'planoId',
    description: 'ID do plano',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Alunos do plano obtidos com sucesso',
    type: [AlunoPlano],
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async buscarAlunosPorPlano(@Param('planoId', ParseIntPipe) planoId: number): Promise<AlunoPlano[]> {
    return await this.servicoAlunoPlano.buscarAlunosPorPlano(planoId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar progresso de um aluno em um plano',
    description: 'Atualiza o progresso, status e observações de um aluno em um plano específico. Se o status for alterado para "concluído", a data de conclusão é definida automaticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da associação (NÃO UTILIZADO - mantido apenas para compatibilidade de rota)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Progresso atualizado com sucesso',
    type: AlunoPlano,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou campos obrigatórios faltando',
  })
  @ApiResponse({
    status: 404,
    description: 'Associação aluno-plano não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async atualizarProgresso(
    @Param('id', ParseIntPipe) id: number,
    @Body() atualizarProgressoDto: AtualizarProgressoDto,
  ): Promise<AlunoPlano> {
    return await this.servicoAlunoPlano.atualizarProgresso(atualizarProgressoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover associação aluno-plano',
    description: 'Remove permanentemente a associação entre um aluno e um plano. ATENÇÃO: Esta operação é irreversível e deve ser usada apenas para correção de dados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da associação (NÃO UTILIZADO - mantido apenas para compatibilidade de rota)',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Associação removida com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou campos obrigatórios faltando',
  })
  @ApiResponse({
    status: 404,
    description: 'Associação aluno-plano não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou não fornecido',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async removerAssociacao(
    @Param('id', ParseIntPipe) id: number,
    @Body() removerAssociacaoDto: RemoverAssociacaoDto,
  ): Promise<void> {
    await this.servicoAlunoPlano.removerAssociacao(removerAssociacaoDto);
  }
}
