import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioController } from './controllers/usuarioController';
import { ServicoUsuario } from './services/servicoUsuario';
import { Usuario } from './entities/usuario.entity';
import { GrupoUsuario } from './entities/grupoUsuario.entity';
import { AlunoInfo } from './entities/alunoInfo.entity';
import { AdministradorInfo } from './entities/administradorInfo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      GrupoUsuario,
      AlunoInfo,
      AdministradorInfo,
    ]),
  ],
  controllers: [UsuarioController],
  providers: [ServicoUsuario],
  exports: [ServicoUsuario],
})
export class UsuariosModule {}
