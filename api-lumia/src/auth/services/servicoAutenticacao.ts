import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { GrupoUsuario } from '../../usuarios/entities/grupoUsuario.entity';
import { AlunoInfo } from '../../usuarios/entities/alunoInfo.entity';
import { AdministradorInfo } from '../../usuarios/entities/administradorInfo.entity';

export interface DadosLogin {
  login: string;
  senha: string;
  grupo: string;
}

// Interface removida - registro agora é feito apenas pelo ServicoUsuario
// export interface DadosRegistro {
//   nome: string;
//   login: string;
//   senha: string;
//   grupo: string;
// }

export interface RespostaAutenticacao {
  success: boolean;
  message: string;
  token?: string;
  usuario?: Usuario;
}

@Injectable()
export class ServicoAutenticacao {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(GrupoUsuario)
    private grupoRepository: Repository<GrupoUsuario>,
    @InjectRepository(AlunoInfo)
    private alunoInfoRepository: Repository<AlunoInfo>,
    @InjectRepository(AdministradorInfo)
    private administradorInfoRepository: Repository<AdministradorInfo>,
  ) {}

  // Método de teste removido conforme regra geral de desenvolvimento

  // Método de listar grupos movido para o ServicoUsuario

  // Método de teste removido conforme regra geral de desenvolvimento

  // Método de teste removido conforme regra geral de desenvolvimento

  // Método de registro removido - usuários agora são criados apenas via ServicoUsuario

  async login(dadosLogin: DadosLogin): Promise<RespostaAutenticacao> {
    const { login, senha, grupo } = dadosLogin;

    // Validação dos dados obrigatórios
    if (!login || !senha || !grupo) {
      throw new BadRequestException('Email, senha e grupo são obrigatórios');
    }

    // Busca o usuário com relacionamentos
    const usuario = await this.usuarioRepository.findOne({
      where: { login },
      relations: ['grupo'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    // Verifica se o usuário está ativo
    if (!usuario.situacao) {
      throw new UnauthorizedException('Usuário inativo');
    }

    // Verifica se o grupo corresponde
    if (usuario.grupo.nome !== grupo) {
      throw new UnauthorizedException('Grupo de usuário incorreto');
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    // Gera o token JWT
    const payload = { 
      sub: usuario.id, // Adicionado campo sub para compatibilidade com estratégia JWT
      id: usuario.id,
      email: usuario.login,
      role: usuario.grupo.nome,
      'sis-mentoria': {
        role_name: usuario.grupo.nome === 'administrador' ? 'Administrador' : 'Aluno',
        permissions: usuario.grupo.nome === 'administrador' 
          ? ['read:all', 'write:all', 'impersonate:aluno']
          : ['read:own', 'write:own']
      }
    };
    const token = this.jwtService.sign(payload);

    // Remove a senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
      success: true,
      message: 'Login realizado com sucesso',
      token,
      usuario: usuarioSemSenha as Usuario,
    };
  }

  async obterUsuarioPorId(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['grupo'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return usuario;
  }

  async impersonarUsuario(idUsuarioOriginal: number, idUsuarioAlvo: number): Promise<RespostaAutenticacao> {
        // Verifica se o usuário original é administrador
        const usuarioOriginal = await this.usuarioRepository.findOne({
          where: { id: idUsuarioOriginal },
          relations: ['grupo'],
        });

    if (!usuarioOriginal || usuarioOriginal.grupo.nome !== 'administrador') {
      throw new UnauthorizedException('Apenas administradores podem impersonar usuários');
    }

        // Busca o usuário alvo
        const usuarioAlvo = await this.usuarioRepository.findOne({
          where: { id: idUsuarioAlvo },
          relations: ['grupo', 'alunoInfo', 'administradorInfo'],
        });

    if (!usuarioAlvo) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

        // Gera token para o usuário alvo com informações de impersonação
        const payload = { 
          sub: usuarioAlvo.id, 
          login: usuarioAlvo.login, 
          grupo: usuarioAlvo.grupo.nome,
          role: usuarioAlvo.grupo.nome,
          'sis-mentoria': {
            impersonating: {
              originalId: idUsuarioOriginal,
              originalRole: 'administrador',
            },
          },
        };
    const token = this.jwtService.sign(payload);

    // Remove a senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuarioAlvo;

    return {
      success: true,
      message: 'Token de impersonação gerado com sucesso',
      token,
      usuario: usuarioSemSenha as Usuario,
    };
  }
}
