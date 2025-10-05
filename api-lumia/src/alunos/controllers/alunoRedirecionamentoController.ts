import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Inject,
  forwardRef,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiExcludeController,
} from '@nestjs/swagger';
import { ServicoUsuario } from '../../usuarios/services/servicoUsuario';
import { CriarAlunoDto } from '../dto/criarAluno.dto';
import { AtualizarAlunoDto } from '../dto/atualizarAluno.dto';
import { AlterarSenhaDto } from '../../usuarios/dto/alterarSenha.dto';
import { NotificacoesAlunoDto } from '../../usuarios/dto/notificacoesAluno.dto';
import { GuardAdministrador } from '../../common/guards/guardAdministrador';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ServicoAluno } from '../services/servicoAluno';

/**
 * Controlador de redirecionamento temporário para manter compatibilidade com o frontend
 * 
 * Este controlador redireciona as requisições dos endpoints antigos do módulo de alunos
 * para os novos endpoints consolidados no módulo de usuários.
 * 
 * @deprecated Este controlador será removido em versões futuras.
 * Atualize o frontend para usar os endpoints do módulo de usuários diretamente.
 */
@ApiTags('Alunos (Redirecionamento)')
@ApiExcludeController() // Oculta da documentação Swagger
@Controller('alunos')
export class AlunoRedirecionamentoController {
  constructor(
    private readonly servicoUsuario: ServicoUsuario,
    @Inject(forwardRef(() => ServicoAluno))
    private readonly servicoAluno: ServicoAluno,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async criarAluno(@Body() criarAlunoDto: CriarAlunoDto) {
    console.log('⚠️ Redirecionando POST /api/alunos para ServicoUsuario.criarUsuario');
    
    // Adapta o DTO de aluno para o formato esperado pelo serviço de usuários
    const dadosUsuario = {
      nome: criarAlunoDto.nome,
      email: criarAlunoDto.email,
      cpf: criarAlunoDto.cpf,
      senha: criarAlunoDto.senha,
      grupo: 'aluno',
    };
    
    const usuario = await this.servicoUsuario.criarUsuario(dadosUsuario);
    
    // Remove a senha da resposta
    const { senha, ...usuarioSemSenha } = usuario;
    
    // Busca as informações complementares do aluno
    const alunoInfo = await this.servicoUsuario.buscarInfoAluno(usuario.id);
    
    // Retorna no formato esperado pelo frontend
    return {
      usuario: usuarioSemSenha,
      alunoInfo,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseGuards(GuardAdministrador)
  async buscarTodosAlunos() {
    console.log('⚠️ Redirecionando GET /api/alunos para ServicoUsuario.buscarTodosAlunos');
    return await this.servicoUsuario.buscarTodosAlunos();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async buscarAlunoPorId(@Param('id', ParseIntPipe) id: number) {
    console.log(`⚠️ Redirecionando GET /api/alunos/${id} para ServicoUsuario.buscarAlunoPorId`);
    return await this.servicoUsuario.buscarAlunoPorId(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async atualizarAluno(
    @Param('id', ParseIntPipe) id: number,
    @Body() atualizarAlunoDto: AtualizarAlunoDto,
  ) {
    console.log(`⚠️ Redirecionando PUT /api/alunos/${id} para ServicoUsuario.atualizarUsuario`);
    return await this.servicoUsuario.atualizarUsuario(id, atualizarAlunoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseGuards(GuardAdministrador)
  async removerAluno(@Param('id', ParseIntPipe) id: number): Promise<void> {
    console.log(`⚠️ Redirecionando DELETE /api/alunos/${id} para ServicoUsuario.removerUsuario`);
    await this.servicoUsuario.removerUsuario(id);
  }

  @Post(':id/definir-senha')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async definirSenha(
    @Param('id', ParseIntPipe) id: number,
    @Body() alterarSenhaDto: AlterarSenhaDto,
    @Req() req: any,
  ) {
    console.log(`⚠️ Redirecionando POST /api/alunos/${id}/definir-senha para ServicoUsuario.alterarSenha`);
    await this.servicoUsuario.alterarSenha(id, alterarSenhaDto, req.user);
    
    const message = req.user?.grupo?.nome === 'administrador' 
      ? 'Senha definida com sucesso' 
      : 'Senha alterada com sucesso';
    
    return { message };
  }

  @Post(':id/gerar-senha')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseGuards(GuardAdministrador)
  async gerarSenha(@Param('id', ParseIntPipe) id: number) {
    console.log(`⚠️ Redirecionando POST /api/alunos/${id}/gerar-senha para ServicoUsuario.gerarSenha`);
    return await this.servicoUsuario.gerarSenha(id);
  }

  @Put(':id/notificacoes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async atualizarNotificacoes(
    @Param('id', ParseIntPipe) id: number,
    @Body() notificacoesDto: NotificacoesAlunoDto,
  ) {
    console.log(`⚠️ Redirecionando PUT /api/alunos/${id}/notificacoes para ServicoUsuario.atualizarNotificacoes`);
    return await this.servicoUsuario.atualizarNotificacoes(id, notificacoesDto);
  }

  @Get('sprints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async listarSprintsDoAluno(@Req() req: any) {
    console.log(`⚠️ Redirecionando GET /api/alunos/sprints para ServicoAluno.listarSprintsDoAluno`);
    const idUsuario = req.user?.id;
    return await this.servicoAluno.listarSprintsDoAluno(idUsuario);
  }

  // Endpoints de teste removidos conforme solicitado
}
