import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

/**
 * Serviço específico para funcionalidades do domínio de alunos
 * 
 * Este serviço contém apenas funcionalidades específicas do domínio de alunos,
 * como gerenciamento de planos, sprints e métricas.
 * 
 * As operações CRUD básicas de alunos foram consolidadas no ServicoUsuario.
 */
@Injectable()
export class ServicoAluno {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * Lista as sprints associadas a um aluno
   * 
   * @param {number} idUsuario - ID do usuário/aluno
   * @returns {Promise<any[]>} Lista de sprints do aluno
   * @throws {NotFoundException} Se o usuário não for encontrado
   * @throws {BadRequestException} Se o usuário não for um aluno
   */
  async listarSprintsDoAluno(idUsuario: number): Promise<any[]> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: idUsuario },
      relations: ['grupo'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (usuario.grupo?.nome !== 'aluno') {
      throw new BadRequestException('Usuário não é um aluno');
    }

    // Aqui você implementaria a lógica para buscar as sprints do aluno
    // Por enquanto, retornamos um array vazio para não quebrar o frontend
    console.log(`Buscando sprints para o aluno ID ${idUsuario}`);
    
    // TODO: Implementar a busca de sprints do aluno
    // Exemplo de implementação futura:
    // const sprints = await this.sprintRepository.find({
    //   where: { aluno: { id: idUsuario } },
    //   relations: ['plano', 'metas'],
    // });
    
    return [];
  }
  
  // Adicione aqui outros métodos específicos do domínio de alunos
  // como métricas, progresso, etc.
}
