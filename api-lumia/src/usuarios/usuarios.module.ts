import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioController } from './controllers/usuarioController';
import { ServicoUsuario } from './services/servicoUsuario';
import { Usuario } from './entities/usuario.entity';
import { GrupoUsuario } from './entities/grupoUsuario.entity';
import { AlunoInfo } from './entities/alunoInfo.entity';
import { AdministradorInfo } from './entities/administradorInfo.entity';
import { AlunoPlanos } from '../planos/entities/alunoPlanos.entity';
import { Plano } from '../planos/entities/plano.entity';
import { PlanoMestre } from '../planos/entities/planoMestre.entity';
import { Sprint } from '../sprints/entities/sprint.entity';
import { Meta } from '../metas/entities/meta.entity';
import { PlanosModule } from '../planos/planos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      GrupoUsuario,
      AlunoInfo,
      AdministradorInfo,
      AlunoPlanos,      // ✅ Adicionado para AlunoPlanosRepository
      Plano,            // ✅ Adicionado para PlanoRepository
      PlanoMestre,      // ✅ Adicionado para PlanoMestreRepository
      Sprint,           // ✅ Adicionado para SprintRepository
      Meta,             // ✅ Adicionado para MetaRepository
    ]),
    forwardRef(() => PlanosModule), // Para ServicoPlano
  ],
  controllers: [UsuarioController],
  providers: [ServicoUsuario],
  exports: [ServicoUsuario],
})
export class UsuariosModule {}
