import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MetaMestre } from '../entities/metaMestre.entity';
import { Meta } from '../entities/meta.entity';
import { CriarMetaMestreNovaDto } from '../dto/criarMetaMestre.dto';
import { AtualizarMetaMestreDto } from '../dto/atualizarMetaMestre.dto';
import { CriarMetaDto } from '../dto/criarMeta.dto';
import { AtualizarMetaInstanciaDto } from '../dto/atualizarMeta.dto';
import { ReordenarMetasDto } from '../dto/reordenarMetas.dto';
import { AdicionarMetasMestreDto } from '../dto/adicionarMetas.dto';
import { StatusMeta } from '../../common/enums/statusMeta.enum';

@Injectable()
export class ServicoMeta {
  constructor(
    @InjectRepository(MetaMestre)
    private metaMestreRepository: Repository<MetaMestre>,
    @InjectRepository(Meta)
    private metaRepository: Repository<Meta>,
    private dataSource: DataSource,
  ) {}

  /**
   * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
   * NÃO ALTERAR sem consultar o time de desenvolvimento
   * 
   * Cria uma nova meta mestre
   * Esta função é específica para o template de plano e é usada apenas na interface do administrador
   * 
   * Gerenciamento de Posições:
   * - Ao criar uma única meta, busca a última posição na sprint e incrementa
   * - Diferente da criação em lote (createSprint), aqui é seguro consultar o banco
   *   pois estamos criando apenas uma meta por vez
   * - Se não houver metas na sprint, começa com posição 1
   */
  async criarMetaMestre(criarMetaMestreDto: CriarMetaMestreNovaDto): Promise<MetaMestre> {
    const { disciplina, tipo, assunto, comandos, link, relevancia, sprintId } = criarMetaMestreDto;

    // Verificar se o sprintId foi fornecido
    if (!sprintId) {
      throw new BadRequestException('É necessário associar a meta a uma sprint');
    }

    // Determinar a próxima posição disponível para esta sprint
    const ultimaMetaMestre = await this.metaMestreRepository.findOne({
      where: { sprintMestreId: sprintId },
      order: { posicao: 'DESC' },
    });
    
    const proximaPosicao = ultimaMetaMestre ? ultimaMetaMestre.posicao + 1 : 1;

    // Criar a meta mestre
    const metaMestre = this.metaMestreRepository.create({
      disciplina,
      tipo,
      assunto,
      comandos,
      link,
      relevancia,
      sprintMestreId: sprintId,
      posicao: proximaPosicao,
    });

    return await this.metaMestreRepository.save(metaMestre);
  }

  /**
   * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
   * NÃO ALTERAR sem consultar o time de desenvolvimento
   * 
   * Reordena as metas mestre de uma sprint mestre
   * Esta função é específica para templates e é usada apenas na interface do administrador
   * 
   * Gerenciamento de Posições:
   * - Recebe um array com a nova ordem dos IDs das metas
   * - Atualiza as posições em uma única transação para garantir consistência
   * - Posições são atribuídas sequencialmente (1, 2, 3, etc.) baseado na ordem do array
   */
  async reordenarMetasMestre(reordenarMetasDto: ReordenarMetasDto): Promise<MetaMestre[]> {
    const { sprintId, ordemMetas } = reordenarMetasDto;
    
    if (!sprintId || !ordemMetas || !Array.isArray(ordemMetas) || ordemMetas.length === 0) {
      throw new BadRequestException('Dados inválidos. sprintId e ordemMetas (array) são necessários');
    }
    
    // Verificar se todas as metas mestre pertencem à sprint mestre
    const metasMestre = await this.metaMestreRepository.find({
      where: { sprintMestreId: sprintId },
    });
    
    const metaMestreIds = metasMestre.map(m => m.id);
    
    for (const id of ordemMetas) {
      if (!metaMestreIds.includes(id)) {
        throw new BadRequestException(`Meta com ID ${id} não pertence à sprint ${sprintId}`);
      }
    }
    
    // Verificar se todos os IDs de metas mestre da sprint estão na ordemMetas
    if (new Set([...metaMestreIds]).size !== new Set([...ordemMetas]).size) {
      throw new BadRequestException('A lista de metas fornecida não contém todas as metas da sprint');
    }
    
    // Atualizar posições em uma transação para garantir consistência
    await this.dataSource.transaction(async (manager) => {
      for (let i = 0; i < ordemMetas.length; i++) {
        await manager.update(
          MetaMestre,
          { id: ordemMetas[i] },
          { posicao: i + 1 }
        );
      }
    });
    
    // Retornar as metas mestres reordenadas
    return await this.metaMestreRepository.find({
      where: { sprintMestreId: sprintId },
      order: { posicao: 'ASC' },
    });
  }

  /**
   * ATENÇÃO: Função utilizada no módulo de alunos (Planos de Estudo)
   * NÃO ALTERAR sem consultar o time de desenvolvimento
   * 
   * Cria uma nova meta (instância)
   * Esta função é específica para instâncias de plano e é usada apenas na interface do aluno/mentor
   */
  async criarMetaInstancia(criarMetaDto: CriarMetaDto): Promise<Meta> {
    const { disciplina, tipo, assunto, comandos, link, relevancia, sprintId } = criarMetaDto;

    // Verificar se o sprintId foi fornecido
    if (!sprintId) {
      throw new BadRequestException('É necessário associar a meta a uma sprint');
    }

    // Determinar a próxima posição disponível para esta sprint
    const ultimaMeta = await this.metaRepository.findOne({
      where: { sprintId: sprintId },
      order: { posicao: 'DESC' },
    });
    
    const proximaPosicao = ultimaMeta ? ultimaMeta.posicao + 1 : 1;

    // Criar a meta
    const meta = this.metaRepository.create({
      disciplina,
      tipo,
      assunto,
      comandos,
      link,
      relevancia,
      sprintId: sprintId,
      posicao: proximaPosicao,
    });

    return await this.metaRepository.save(meta);
  }

  /**
   * ATENÇÃO: Função utilizada no módulo de alunos (Planos de Estudo)
   * NÃO ALTERAR sem consultar o time de desenvolvimento
   * 
   * Reordena as metas de uma sprint
   * Esta função é específica para instâncias e é usada apenas na interface do aluno/mentor
   */
  async reordenarMetas(reordenarMetasDto: ReordenarMetasDto): Promise<Meta[]> {
    const { sprintId, ordemMetas } = reordenarMetasDto;
    
    if (!sprintId || !ordemMetas || !Array.isArray(ordemMetas) || ordemMetas.length === 0) {
      throw new BadRequestException('Dados inválidos. sprintId e ordemMetas (array) são necessários');
    }
    
    // Verificar se todas as metas pertencem à sprint
    const metas = await this.metaRepository.find({
      where: { sprintId: sprintId },
    });
    
    const metaIds = metas.map(m => m.id);
    
    for (const id of ordemMetas) {
      if (!metaIds.includes(id)) {
        throw new BadRequestException(`Meta com ID ${id} não pertence à sprint ${sprintId}`);
      }
    }
    
    // Verificar se todos os IDs de metas da sprint estão na ordemMetas
    if (new Set([...metaIds]).size !== new Set([...ordemMetas]).size) {
      throw new BadRequestException('A lista de metas fornecida não contém todas as metas da sprint');
    }
    
    // Atualizar posições em uma transação para garantir consistência
    await this.dataSource.transaction(async (manager) => {
      for (let i = 0; i < ordemMetas.length; i++) {
        await manager.update(
          Meta,
          { id: ordemMetas[i] },
          { posicao: i + 1 }
        );
      }
    });
    
    // Retornar as metas reordenadas
    return await this.metaRepository.find({
      where: { sprintId: sprintId },
      order: { posicao: 'ASC' },
    });
  }

  /**
   * Atualiza uma meta mestre existente
   */
  async atualizarMetaMestre(id: number, atualizarMetaMestreDto: AtualizarMetaMestreDto): Promise<MetaMestre> {
    const metaMestre = await this.metaMestreRepository.findOne({ where: { id } });
    
    if (!metaMestre) {
      throw new NotFoundException('Meta mestre não encontrada');
    }

    // Atualizar apenas os campos fornecidos
    Object.assign(metaMestre, atualizarMetaMestreDto);
    
    return await this.metaMestreRepository.save(metaMestre);
  }

  /**
   * Atualiza uma meta instanciada existente
   */
  async atualizarMeta(id: number, atualizarMetaDto: AtualizarMetaInstanciaDto): Promise<Meta> {
    const meta = await this.metaRepository.findOne({ where: { id } });
    
    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }

    // Atualizar apenas os campos fornecidos
    Object.assign(meta, atualizarMetaDto);
    
    return await this.metaRepository.save(meta);
  }

  /**
   * Adiciona múltiplas metas mestre a uma sprint mestre
   * Valida posições únicas e cria as metas em lote
   */
  async adicionarMetasMestre(sprintId: number, adicionarMetasDto: AdicionarMetasMestreDto): Promise<MetaMestre[]> {
    const { metas } = adicionarMetasDto;

    // Validar posições únicas
    const posicoes = metas.map(meta => meta.posicao);
    const posicoesUnicas = new Set(posicoes);
    
    if (posicoes.length !== posicoesUnicas.size) {
      const posicoesRepetidas = posicoes.filter((pos, index) => posicoes.indexOf(pos) !== index);
      throw new BadRequestException(
        `Existem posições repetidas na planilha: ${posicoesRepetidas.join(', ')}. Cada meta deve ter uma posição única.`
      );
    }

    // Criar as metas mestre
    const metasMestre = metas.map(meta => 
      this.metaMestreRepository.create({
        ...meta,
        sprintMestreId: sprintId,
      })
    );

    return await this.metaMestreRepository.save(metasMestre);
  }

  /**
   * Busca uma meta mestre por ID
   */
  async buscarMetaMestrePorId(id: number): Promise<MetaMestre> {
    const metaMestre = await this.metaMestreRepository.findOne({ where: { id } });
    
    if (!metaMestre) {
      throw new NotFoundException('Meta mestre não encontrada');
    }

    return metaMestre;
  }

  /**
   * Busca uma meta instanciada por ID
   */
  async buscarMetaPorId(id: number): Promise<Meta> {
    const meta = await this.metaRepository.findOne({ where: { id } });
    
    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }

    return meta;
  }

  /**
   * Busca todas as metas mestre de uma sprint mestre
   */
  async buscarMetasMestrePorSprint(sprintId: number): Promise<MetaMestre[]> {
    return await this.metaMestreRepository.find({
      where: { sprintMestreId: sprintId },
      order: { posicao: 'ASC' },
    });
  }

  /**
   * Busca todas as metas instanciadas de uma sprint
   */
  async buscarMetasPorSprint(sprintId: number): Promise<Meta[]> {
    return await this.metaRepository.find({
      where: { sprintId: sprintId },
      order: { posicao: 'ASC' },
    });
  }

  /**
   * Remove uma meta mestre
   */
  async removerMetaMestre(id: number): Promise<void> {
    const metaMestre = await this.metaMestreRepository.findOne({ where: { id } });
    
    if (!metaMestre) {
      throw new NotFoundException('Meta mestre não encontrada');
    }

    await this.metaMestreRepository.remove(metaMestre);
  }

  /**
   * Remove uma meta instanciada
   */
  async removerMeta(id: number): Promise<void> {
    const meta = await this.metaRepository.findOne({ where: { id } });
    
    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }

    await this.metaRepository.remove(meta);
  }
}
