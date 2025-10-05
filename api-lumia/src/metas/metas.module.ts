import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetaMestre } from './entities/metaMestre.entity';
import { Meta } from './entities/meta.entity';
import { ServicoMeta } from './services/servicoMeta';
import { MetaController } from './controllers/metaController';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetaMestre, Meta]),
  ],
  providers: [ServicoMeta],
  controllers: [MetaController],
  exports: [ServicoMeta],
})
export class MetasModule {}
