import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class GuardProprioOuAdministrador implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const usuario: Usuario = request.user;
    const params = request.params;

    if (!usuario) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Se for administrador, permite acesso a qualquer recurso
    if (usuario.grupo.nome === 'administrador') {
      return true;
    }

    // Para alunos, verifica se está acessando seu próprio recurso
    const resourceId = parseInt(params.id);
    if (usuario.id === resourceId) {
      return true;
    }

    throw new ForbiddenException('Você só pode acessar seus próprios dados');
  }
}
