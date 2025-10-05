import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServicoRanking } from './services/servicoRanking';
import { RankingController } from './controllers/rankingController';
import { RankingJob } from './jobs/rankingJob';
import { RankingSemanal } from './entities/rankingSemanal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RankingSemanal]),
    ScheduleModule.forRoot(), // Para os jobs agendados
  ],
  controllers: [RankingController],
  providers: [ServicoRanking, RankingJob],
  exports: [ServicoRanking, RankingJob],
})
export class RankingModule {}
