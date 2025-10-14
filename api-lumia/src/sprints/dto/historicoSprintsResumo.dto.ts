import { ApiProperty } from '@nestjs/swagger';
import { SprintAtualResumoDto } from './sprintAtualResumo.dto';
import { SprintPendenteResumoDto } from './sprintPendenteResumo.dto';
import { SprintFinalizadaResumoDto } from './sprintFinalizadaResumo.dto';

/**
 * DTO de resposta para o histórico completo de sprints do aluno
 * Agrupa sprint atual, sprints pendentes e sprints finalizadas
 */
export class HistoricoSprintsResumoDto {
  @ApiProperty({
    description: 'Informações da sprint atual (em andamento) do aluno',
    type: SprintAtualResumoDto,
    nullable: true
  })
  sprintAtual: SprintAtualResumoDto | null;

  @ApiProperty({
    description: 'Lista de sprints pendentes (futuras) do aluno',
    type: [SprintPendenteResumoDto]
  })
  sprintsPendentes: SprintPendenteResumoDto[];

  @ApiProperty({
    description: 'Lista de sprints finalizadas, ordenadas por data de conclusão descendente',
    type: [SprintFinalizadaResumoDto]
  })
  sprintsFinalizadas: SprintFinalizadaResumoDto[];
}
