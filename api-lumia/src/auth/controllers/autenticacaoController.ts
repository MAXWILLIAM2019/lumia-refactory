import { Controller, Post, Get, Body, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ServicoAutenticacao, DadosLogin } from '../services/servicoAutenticacao';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@ApiTags('Autenticação')
@Controller('auth')
export class AutenticacaoController {
  constructor(private readonly servicoAutenticacao: ServicoAutenticacao) {}

  // Endpoint de registro público removido - usuários agora são criados apenas via /api/usuarios

  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  @ApiBody({
    description: 'Dados para login',
    examples: {
      login_aluno: {
        summary: 'Login de aluno',
        value: {
          login: 'joao.silva@email.com',
          senha: '123456',
          grupo: 'aluno',
        },
      },
      login_admin: {
        summary: 'Login de administrador',
        value: {
          login: 'maria.admin@email.com',
          senha: 'admin123',
          grupo: 'administrador',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async login(@Body() dadosLogin: DadosLogin) {
    return await this.servicoAutenticacao.login(dadosLogin);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário obtidos com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async obterUsuarioLogado(@Request() req: any) {
    // Por enquanto, vamos buscar o usuário manualmente
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        message: 'Token não fornecido',
      };
    }
    
    const token = authHeader.substring(7);
    try {
      // Decodifica o token JWT manualmente
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const usuario = await this.servicoAutenticacao.obterUsuarioPorId(payload.sub);
      
      return {
        success: true,
        message: 'Dados do usuário obtidos com sucesso',
        usuario: usuario,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token inválido',
        error: error.message,
      };
    }
  }

  // Endpoint de listar grupos movido para o módulo de usuários (/api/usuarios/grupos)

  @Post('impersonate/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Impersonar usuário (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Token de impersonação gerado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async impersonarUsuario(
    @Request() req: { user: Usuario },
    @Param('id', ParseIntPipe) idUsuarioAlvo: number,
  ) {
    return await this.servicoAutenticacao.impersonarUsuario(req.user.id, idUsuarioAlvo);
  }
}
