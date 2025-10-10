import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ServicoRanking } from '../services/servicoRanking';
import { RankingQueryDto } from '../dto/rankingQuery.dto';
import { RankingResponseDto, MeuRankingResponseDto } from '../dto/rankingResponse.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Usuario } from '../../usuarios/entities/usuario.entity';

interface RequestWithUser extends ExpressRequest {
  user: Usuario;
}

@ApiTags('Ranking')
@Controller('ranking')
// Ranking público - sem guard global
export class RankingController {
  constructor(private readonly servicoRanking: ServicoRanking) {}

  @Get()
  @ApiOperation({ 
    summary: 'Obter ranking global semanal',
    description: 'Retorna o ranking semanal de todos os alunos com paginação. O ranking é baseado na pontuação final calculada a partir do desempenho nas questões respondidas durante a semana atual.'
  })
  @ApiQuery({ name: 'limite', required: false, description: 'Número de itens por página (padrão: 50)', example: 25 })
  @ApiQuery({ name: 'pagina', required: false, description: 'Número da página (padrão: 1)', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking carregado com sucesso',
    type: RankingResponseDto
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async obterRanking(@Query() query: RankingQueryDto): Promise<RankingResponseDto> {
    return await this.servicoRanking.obterRanking(query);
  }

  @Get('meu-ranking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obter posição do usuário logado no ranking',
    description: 'Retorna a posição e dados do usuário autenticado no ranking semanal atual. Se o usuário não estiver no ranking desta semana, retorna data como null.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados do ranking do usuário obtidos com sucesso',
    type: MeuRankingResponseDto
  })
  @ApiResponse({ status: 401, description: 'Token de autenticação inválido ou ausente' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async obterMeuRanking(@Request() req: RequestWithUser): Promise<MeuRankingResponseDto> {
    const usuarioId = req.user.id;

    return await this.servicoRanking.obterMeuRanking(usuarioId);
  }
}
