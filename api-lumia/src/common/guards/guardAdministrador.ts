import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class GuardAdministrador implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const usuario: Usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (usuario.grupo.nome !== 'administrador') {
      throw new ForbiddenException('Apenas administradores podem acessar este recurso');
    }

    return true;
  }
}
