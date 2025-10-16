import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';
import { ServicoDashboard } from '../services/servicoDashboard';
import { MetricasDashboardDto } from '../dto/metricasDashboard.dto';

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
}


