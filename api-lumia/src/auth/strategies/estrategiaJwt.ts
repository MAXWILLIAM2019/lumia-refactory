import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EstrategiaJwt extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'sis_mentoria_secret_key_2024',
    });
  }

  async validate(payload: any): Promise<Usuario> {
    const { sub: id } = payload;
    
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['grupo', 'alunoInfo', 'administradorInfo'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Token inválido - usuário não encontrado');
    }

    if (!usuario.situacao) {
      throw new UnauthorizedException('Usuário inativo');
    }

    return usuario;
  }
}
