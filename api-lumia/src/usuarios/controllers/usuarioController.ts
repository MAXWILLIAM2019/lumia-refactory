import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ServicoUsuario } from '../services/servicoUsuario';
import { CriarUsuarioDto } from '../dto/criarUsuario.dto';
import { AtualizarUsuarioDto } from '../dto/atualizarUsuario.dto';
import { AlterarSenhaDto } from '../dto/alterarSenha.dto';
import { NotificacoesAlunoDto } from '../dto/notificacoesAluno.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';
import { GuardProprioOuAdministrador } from '../../common/guards/guardProprioOuAdministrador';

@ApiTags('Usuários')
@Controller('usuarios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsuarioController {
  constructor(private readonly servicoUsuario: ServicoUsuario) {}

  @Post()
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email ou CPF já existente' })
  async criarUsuario(@Body() dadosUsuario: CriarUsuarioDto) {
    const usuario = await this.servicoUsuario.criarUsuario(dadosUsuario);
    
    // Remove a senha da resposta
    const { senha, ...usuarioSemSenha } = usuario;
    
    return {
      message: 'Usuário criado com sucesso',
      usuario: usuarioSemSenha,
    };
  }

  @Get()
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  async listarTodosUsuarios() {
    const usuarios = await this.servicoUsuario.buscarTodosUsuarios();
    
    // Remove senhas da resposta
    const usuariosSemSenha = usuarios.map(usuario => {
      const { senha, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    });
    
    return usuariosSemSenha;
  }

  @Get('alunos')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Listar todos os alunos' })
  @ApiResponse({ status: 200, description: 'Lista de alunos retornada com sucesso' })
  async listarAlunos() {
    const alunos = await this.servicoUsuario.buscarUsuariosPorGrupo('aluno');
    
    // Remove senhas da resposta
    const alunosSemSenha = alunos.map(aluno => {
      const { senha, ...alunoSemSenha } = aluno;
      return alunoSemSenha;
    });
    
    return alunosSemSenha;
  }

  @Get(':id')
  @UseGuards(GuardProprioOuAdministrador)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async buscarUsuarioPorId(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.servicoUsuario.buscarUsuarioPorId(id);
    
    // Remove a senha da resposta
    const { senha, ...usuarioSemSenha } = usuario;
    
    return usuarioSemSenha;
  }

  @Put(':id')
  @UseGuards(GuardProprioOuAdministrador)
  @ApiOperation({ summary: 'Atualizar dados do usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já existente' })
  async atualizarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosAtualizacao: AtualizarUsuarioDto,
  ) {
    const usuario = await this.servicoUsuario.atualizarUsuario(id, dadosAtualizacao);
    
    // Remove a senha da resposta
    const { senha, ...usuarioSemSenha } = usuario;
    
    return usuarioSemSenha;
  }

  @Delete(':id')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Remover usuário (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @HttpCode(HttpStatus.OK)
  async removerUsuario(@Param('id', ParseIntPipe) id: number) {
    await this.servicoUsuario.removerUsuario(id);
    
    return { message: 'Usuário removido com sucesso' };
  }

  @Put(':id/senha')
  @UseGuards(GuardProprioOuAdministrador)
  @ApiOperation({ summary: 'Alterar senha do usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou senha atual incorreta' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @HttpCode(HttpStatus.OK)
  async alterarSenha(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosSenha: AlterarSenhaDto,
    @Request() req: any,
  ) {
    await this.servicoUsuario.alterarSenha(id, dadosSenha, req.user);
    
    const message = req.user.grupo.nome === 'administrador' 
      ? 'Senha definida com sucesso' 
      : 'Senha alterada com sucesso';
    
    return { message };
  }


  @Post('gerar-senha')
  @UseGuards(GuardAdministrador)
  @ApiOperation({ summary: 'Gerar senha aleatória para formulários de cadastro' })
  @ApiResponse({
    status: 200,
    description: 'Senha gerada com sucesso',
    schema: {
      type: 'object',
      properties: {
        senha: {
          type: 'string',
          example: 'a1b2c3d4',
          description: 'Senha aleatória gerada de 8 caracteres'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async gerarSenhaCadastro() {
    const senhaGerada = await this.servicoUsuario.gerarSenhaAleatoria();

    return {
      senha: senhaGerada,
    };
  }

  @Put(':id/notificacoes')
  @UseGuards(GuardProprioOuAdministrador)
  @ApiOperation({ summary: 'Atualizar configurações de notificação do aluno' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Notificações atualizadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Apenas alunos podem configurar notificações' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async atualizarNotificacoes(
    @Param('id', ParseIntPipe) id: number,
    @Body() notificacoes: NotificacoesAlunoDto,
  ) {
    // O método já retorna o objeto formatado
    return await this.servicoUsuario.atualizarNotificacoes(id, notificacoes);
  }

  // Endpoint de listar grupos removido por não ser utilizado
}
