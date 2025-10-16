import { Controller, Get, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';
import { ServicoDashboard } from '../services/servicoDashboard';
import { MetricasDashboardDto } from '../dto/metricasDashboard.dto';
import { AlunosDashboardDto } from '../dto/alunosDashboard.dto';

/**
 * Controller responsável pelos endpoints administrativos do dashboard
 * Requer autenticação JWT e permissões de administrador
 */
@ApiTags('Admin - Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, GuardAdministrador)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly servicoDashboard: ServicoDashboard) {}

  @Get('metricas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar métricas gerais do dashboard administrativo',
    description: 'Retorna métricas calculadas para o dashboard administrativo: total de alunos ativos (cadastrados), alunos criados no mês corrente, percentual de metas concluídas no mês e média diária de tempo de estudo'
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas retornadas com sucesso',
    type: MetricasDashboardDto
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido'
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Requer permissões de administrador'
  })
  async buscarMetricas(): Promise<MetricasDashboardDto> {
    const totalAlunosAtivos = await this.servicoDashboard.contarAlunosAtivos();
    const alunosMatriculadosMes = await this.servicoDashboard.contarAlunosMatriculadosMesCorrente();
    const percentualMetasConcluidasMes = await this.servicoDashboard.calcularPercentualMetasConcluidasMes();
    const tempoEstudoDiarioMedio = await this.servicoDashboard.calcularTempoEstudoDiarioMedio();

    return {
      totalAlunosAtivos,
      alunosMatriculadosMes,
      percentualMetasConcluidasMes,
      tempoEstudoDiarioMedio
    };
  }

  @Get('alunos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar lista de alunos para dashboard administrativo',
    description: 'Retorna lista paginada de alunos com informações completas: ID, nome, email, CPF, plano ativo, data de cadastro e status'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alunos retornada com sucesso',
    type: AlunosDashboardDto,
    schema: {
      example: {
        alunos: [
          {
            idAluno: 1,
            nomeAluno: 'João Silva Santos',
            emailAluno: 'joao.silva@email.com',
            cpfAluno: '12345678901',
            planoAtivo: 'Plano de Estudos - Desenvolvimento Full Stack',
            dataCadastro: '2025-01-15T10:30:00.000Z',
            status: 'ativo'
          },
          {
            idAluno: 2,
            nomeAluno: 'Maria Oliveira',
            emailAluno: 'maria.oliveira@email.com',
            cpfAluno: '98765432100',
            planoAtivo: null,
            dataCadastro: '2025-01-20T14:15:00.000Z',
            status: 'ativo'
          }
        ],
        paginacao: {
          pagina: 1,
          limite: 10,
          total: 25,
          totalPaginas: 3
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido'
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Requer permissões de administrador'
  })
  async buscarAlunos(
    @Query('pagina') pagina: string = '1',
    @Query('limite') limite: string = '10'
  ): Promise<AlunosDashboardDto> {
    const paginaNum = parseInt(pagina) || 1;
    const limiteNum = parseInt(limite) || 10;

    // Validação básica dos parâmetros
    if (paginaNum < 1) {
      throw new Error('Página deve ser maior que 0');
    }
    if (limiteNum < 1 || limiteNum > 100) {
      throw new Error('Limite deve estar entre 1 e 100');
    }

    return await this.servicoDashboard.buscarAlunosDashboard(paginaNum, limiteNum);
  }
}


