/**
 * Componente de Cadastro e Listagem de Alunos
 * 
 * Este componente implementa:
 * - Formulário para cadastro de novos alunos
 * - Associação do aluno a um plano (relacionamento 1:1 simplificado)
 * - Interface para visualização da lista de alunos cadastrados
 * - Tratamento de erros e feedback ao usuário
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { alunoService } from '../../services/alunoService';
import { alunoPlanoService } from '../../services/alunoPlanoService';
import api from '../../services/api';
import styles from './RegisterStudent.module.css';
import SenhaModal from '../../components/SenhaModal';
import AlunoEditModal from '../../components/AlunoEditModal';
import authService from '../../services/authService';

export default function RegisterStudent() {
  const navigate = useNavigate();
  
  // Estado do formulário de cadastro
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: ''
  });
  
  // Estado da associação com plano
  const [associarPlano, setAssociarPlano] = useState(false);
  const [planoData, setPlanoData] = useState({
    planoId: '',
    dataInicio: new Date().toISOString().split('T')[0],
    status: 'não iniciado',
    observacoes: ''
  });
  const [planos, setPlanos] = useState([]);
  
  // Estado da associação com plano mestre
  const [associarPlanoMestre, setAssociarPlanoMestre] = useState(false);
  const [planoMestreData, setPlanoMestreData] = useState({
    planoMestreId: '',
    dataInicio: new Date().toISOString().split('T')[0],
    status: 'não iniciado',
    observacoes: ''
  });
  const [planosMestre, setPlanosMestre] = useState([]);
  
  // Estados de controle da UI
  const [loading, setLoading] = useState(false);
  const [loadingPlanos, setLoadingPlanos] = useState(false);
  const [loadingPlanosMestre, setLoadingPlanosMestre] = useState(false);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeout = useRef(null);
  const [alunos, setAlunos] = useState([]);
  const [associacoesAlunos, setAssociacoesAlunos] = useState({});
  const [showList, setShowList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  
  // Estado para modal de senha
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [alunoParaSenha, setAlunoParaSenha] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  /**
   * Efeito que carrega os alunos quando a lista é exibida
   */
  useEffect(() => {
    if (showList) {
      carregarAlunos();
    }
  }, [showList]);

  /**
   * Efeito que carrega os planos quando a opção de associar é ativada
   */
  useEffect(() => {
    if (associarPlano) {
      carregarPlanos();
    }
  }, [associarPlano]);

  /**
   * Efeito que carrega os planos mestre quando a opção de associar é ativada
   */
  useEffect(() => {
    if (associarPlanoMestre) {
      carregarPlanosMestre();
    }
  }, [associarPlanoMestre]);

  /**
   * Efeito que controla a exibição do toast de erro
   * para casos específicos como email/CPF duplicados
   */
  useEffect(() => {
    if (error && error.includes('Já existe um aluno cadastrado com este email ou CPF')) {
      setShowToast(true);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setShowToast(false), 3000);
    }
  }, [error]);

  /**
   * Carrega a lista de alunos do backend
   */
  const carregarAlunos = async () => {
    try {
      setLoadingAlunos(true);
      console.log('Carregando lista de alunos...');
      const data = await alunoService.listarAlunos();
      console.log('Dados de alunos recebidos:', data);
      
      // Garante que data é sempre um array, mesmo se a API retornar null/undefined
      const alunosList = Array.isArray(data) ? data : [];
      setAlunos(alunosList);
      window.alunos = alunosList;
      
      // Mapear os IDs dos alunos para depois buscar os planos
      const idsAlunos = alunosList.map(a => a.id);
      
      if (idsAlunos.length > 0) {
        // Abordagem simplificada: buscar todas as associações de uma vez
        try {
          console.log('Buscando associações para os alunos...');
          const todasAssociacoes = await alunoPlanoService.listarAssociacoes();
          console.log('Associações obtidas:', todasAssociacoes);
          
          // Criar um objeto com alunoId como chave
          const associacoesPorAluno = {};
          
          if (Array.isArray(todasAssociacoes)) {
            todasAssociacoes.forEach(assoc => {
              // Identificar o ID do aluno (agora usuário) corretamente e garantir que é number
              const alunoId = Number(assoc.IdUsuario || assoc.idusuario || assoc.AlunoId || assoc.alunoId);
              
              if (alunoId) {
                associacoesPorAluno[alunoId] = [{
                  id: assoc.id,
                  planoNome: assoc.plano?.nome || 'Sem nome',
                  planoCargo: assoc.plano?.cargo || '',
                  status: assoc.status || 'não definido',
                  progresso: assoc.progresso || 0
                }];
              }
            });
          }
          
          console.log('Associações organizadas por aluno:', associacoesPorAluno);
          setAssociacoesAlunos(associacoesPorAluno);
          window.associacoesAlunos = associacoesPorAluno;
          console.log('Dados de alunos recebidos:', alunosList);
          console.log('Associações organizadas por aluno:', associacoesPorAluno);
        } catch (assocError) {
          console.error('Erro ao carregar associações:', assocError);
        }
      }
      
      // Limpa qualquer erro anterior se a requisição for bem-sucedida
      if (error) setError('');
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setError(error.message || 'Erro ao carregar lista de alunos');
      // Inicializa alunos como array vazio em caso de erro
      setAlunos([]);
    } finally {
      setLoadingAlunos(false);
    }
  };

  /**
   * Carrega a lista de planos disponíveis
   */
  const carregarPlanos = async () => {
    try {
      setLoadingPlanos(true);
      const response = await api.get('/planos');
      setPlanos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      setError('Erro ao carregar planos. Tente novamente.');
    } finally {
      setLoadingPlanos(false);
    }
  };

  /**
   * Carrega a lista de planos mestre disponíveis
   */
  const carregarPlanosMestre = async () => {
    try {
      setLoadingPlanosMestre(true);
      const response = await api.get('/planos-mestre');
      setPlanosMestre(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar planos mestre:', error);
      setError('Erro ao carregar planos mestre. Tente novamente.');
    } finally {
      setLoadingPlanosMestre(false);
    }
  };

  /**
   * Aplica máscara para o CPF (formato 123.456.789-00)
   * @param {string} value - CPF sem formatação
   * @returns {string} CPF formatado
   */
  const formatCPF = (value) => {
    // Remove qualquer caractere não numérico
    const cpfNumbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const cpfLimited = cpfNumbers.substring(0, 11);
    
    // Aplica a máscara
    let formattedCPF = cpfLimited;
    
    if (cpfLimited.length > 3) {
      formattedCPF = cpfLimited.replace(/^(\d{3})(\d)/, '$1.$2');
    }
    if (cpfLimited.length > 6) {
      formattedCPF = formattedCPF.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    }
    if (cpfLimited.length > 9) {
      formattedCPF = formattedCPF.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    }
    
    return formattedCPF;
  };

  /**
   * Remove formatação do CPF, mantendo apenas números
   * @param {string} cpf - CPF formatado
   * @returns {string} Apenas números do CPF
   */
  const stripCPF = (cpf) => {
    return cpf.replace(/\D/g, '');
  };

  /**
   * Manipula a entrada de dados no campo CPF
   * Aceita apenas números e aplica a formatação
   * @param {Event} e - Evento de mudança do input
   */
  const handleCPFChange = (e) => {
    // Pega apenas os números do que foi digitado e aplica a máscara
    const formattedValue = formatCPF(e.target.value);
    
    // Atualiza o estado
    setFormData(prev => ({
      ...prev,
      cpf: formattedValue
    }));
  };

  /**
   * Atualiza o estado do formulário quando o usuário digita
   * @param {Event} e - Evento de mudança do input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Campo CPF tem tratamento especial
    if (name === 'cpf') {
      handleCPFChange(e);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Atualiza o estado do plano quando o usuário digita
   * @param {Event} e - Evento de mudança do input
   */
  const handlePlanoChange = (e) => {
    const { name, value } = e.target;
    setPlanoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Atualiza o estado do plano mestre quando o usuário digita
   * @param {Event} e - Evento de mudança do input
   */
  const handlePlanoMestreChange = (e) => {
    const { name, value } = e.target;
    setPlanoMestreData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Atualiza o termo de busca quando o usuário digita
   * @param {Event} e - Evento de mudança do input
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  /**
   * Fecha o modal de senha
   */
  const handleCloseSenhaModal = () => {
    setShowSenhaModal(false);
    setAlunoParaSenha(null);
  };

  /**
   * Submete o formulário para cadastrar um novo aluno
   * @param {Event} e - Evento de submit do formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepara os dados para envio, removendo formatação do CPF
      const dadosEnvio = {
        ...formData,
        cpf: stripCPF(formData.cpf)
      };

      console.log('Enviando dados:', dadosEnvio);
      const response = await alunoService.cadastrarAluno(dadosEnvio);
      console.log('Resposta do servidor (aluno):', response);

      // Extrai os dados do novo fluxo
      const usuario = response.usuario;
      const alunoInfo = response.alunoInfo;
      const idUsuario = usuario?.IdUsuario;

      // Se for para associar a um plano, faz isso após cadastrar o aluno
      if (associarPlano && planoData.planoId && idUsuario) {
        console.log('Associando aluno ao plano:', {
          idusuario: idUsuario,
          PlanoId: planoData.planoId,
          ...planoData,
        });
        try {
          const associacaoResponse = await alunoPlanoService.atribuirPlano({
            idusuario: idUsuario,
            PlanoId: planoData.planoId,
            ...planoData,
          });
          console.log('Resposta do servidor (associação):', associacaoResponse);
        } catch (associacaoError) {
          console.error('Erro ao associar aluno ao plano:', associacaoError);
          alert(`Aluno cadastrado com sucesso, mas não foi possível associá-lo ao plano. Motivo: ${associacaoError.message}`);
        }
      }

      // Se for para criar plano a partir de plano mestre
      if (associarPlanoMestre && planoMestreData.planoMestreId && idUsuario) {
        console.log('Criando plano a partir do plano mestre:', {
          planoMestreId: planoMestreData.planoMestreId,
          idUsuario: idUsuario,
          ...planoMestreData,
        });
        try {
          const criarPlanoResponse = await api.post('/planos-mestre/criar-instancia', {
            planoMestreId: planoMestreData.planoMestreId,
            idUsuario: idUsuario,
            dataInicio: planoMestreData.dataInicio,
            status: planoMestreData.status,
            observacoes: planoMestreData.observacoes
          });
          console.log('Resposta do servidor (criação de plano):', criarPlanoResponse.data);
        } catch (criarPlanoError) {
          console.error('Erro ao criar plano a partir do plano mestre:', criarPlanoError);
          alert(`Aluno cadastrado com sucesso, mas não foi possível criar o plano personalizado. Motivo: ${criarPlanoError.response?.data?.message || criarPlanoError.message}`);
        }
      }

      // Depois do cadastro, abrir o modal de senha
      setAlunoParaSenha({
        id: idUsuario,
        nome: usuario.nome,
        email: usuario.login
      });
      setShowSenhaModal(true);

      // Limpa o formulário
      setFormData({ nome: '', email: '', cpf: '' });
      setPlanoData({
        planoId: '',
        dataInicio: new Date().toISOString().split('T')[0],
        status: 'não iniciado',
        observacoes: ''
      });
      setPlanoMestreData({
        planoMestreId: '',
        dataInicio: new Date().toISOString().split('T')[0],
        status: 'não iniciado',
        observacoes: ''
      });
      setAssociarPlano(false);
      setAssociarPlanoMestre(false);

    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      if (error.message.includes('Já existe um usuário com este email') || 
          error.message.includes('Já existe um usuário com este CPF')) {
        setShowToast(true);
        if (toastTimeout.current) {
          clearTimeout(toastTimeout.current);
        }
        toastTimeout.current = setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manipula a mudança de página
   * @param {Object} selectedItem - Item selecionado na paginação
   */
  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
    // Rolar para o topo da tabela quando mudar de página
    if (document.querySelector(`.${styles.tableContainer}`)) {
      document.querySelector(`.${styles.tableContainer}`).scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtra os alunos de acordo com o termo de busca
  const filteredAlunos = alunos.filter(aluno => {
    const termLower = searchTerm.toLowerCase();
    // Busca por nome, email ou CPF do aluno
    const matchesAluno = 
      aluno.nome.toLowerCase().includes(termLower) ||
      aluno.email.toLowerCase().includes(termLower) ||
      aluno.cpf.toLowerCase().includes(termLower);
    if (matchesAluno) return true;
    // Busca pelo nome do plano
    const temPlanos = associacoesAlunos[Number(aluno.id)] && associacoesAlunos[Number(aluno.id)].length > 0;
    if (temPlanos) {
      return associacoesAlunos[Number(aluno.id)].some(assoc => 
        assoc.planoNome.toLowerCase().includes(termLower)
      );
    }
    return false;
  });

  // Calcula a quantidade de páginas
  const pageCount = Math.ceil(filteredAlunos.length / itemsPerPage);
  
  // Obtém apenas os itens da página atual
  const displayedAlunos = filteredAlunos.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Resetar para a primeira página quando o termo de busca mudar
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  /**
   * Destaca o termo de busca no texto
   * @param {string} text - Texto onde buscar
   * @param {string} term - Termo a ser destacado
   * @returns {string} Texto com o termo destacado com HTML
   */
  const highlightMatch = (text, term) => {
    if (!term.trim() || !text) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="' + styles.highlight + '">$1</mark>');
  };

  // Função para abrir modal de edição
  const handleEditarAluno = (aluno) => {
    setAlunoEditando(aluno);
    setEditModalOpen(true);
    carregarPlanos();
  };

  // Função para salvar edição
  const handleSalvarEdicao = async (dadosEditados) => {
    console.log('=== INÍCIO DA EDIÇÃO DO ALUNO ===');
    console.log('Dados completos recebidos para edição:', dadosEditados);
    console.log('ID do aluno sendo editado:', alunoEditando.id);
    
    setSavingEdit(true);
    try {
      // Atualizar dados do aluno
      console.log('1. Atualizando dados básicos do aluno...');
      await alunoService.atualizarAluno(alunoEditando.id, dadosEditados);
      console.log('✓ Dados básicos do aluno atualizados com sucesso');

      // Se plano foi alterado, criar instância e associar
      if (dadosEditados.planoId) {
        console.log('2. Iniciando processo de plano...');
        console.log('Verificando se é plano mestre:', dadosEditados.planoId);
        
        try {
          // Primeiro tentar criar uma instância do plano mestre
          console.log('2.1 Tentando criar instância do plano mestre...');
          const criarPlanoResponse = await api.post('/planos-mestre/criar-instancia', {
            planoMestreId: Number(dadosEditados.planoId),
            idUsuario: alunoEditando.id,
            dataInicio: new Date().toISOString().split('T')[0],
            status: 'em andamento'
          });
          
          console.log('✓ Instância do plano criada com sucesso:', criarPlanoResponse.data);
        } catch (planoError) {
          console.error('✗ Erro na criação/atribuição do plano:', {
            message: planoError.message,
            response: planoError.response?.data,
            status: planoError.response?.status
          });
          throw new Error(planoError.response?.data?.message || 'Erro ao criar/atribuir plano');
        }
      }

      console.log('3. Finalizando edição...');
      setEditModalOpen(false);
      setAlunoEditando(null);
      carregarAlunos();
      console.log('=== EDIÇÃO CONCLUÍDA COM SUCESSO ===');
    } catch (error) {
      console.error('=== ERRO NA EDIÇÃO ===', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      alert('Erro ao salvar edição: ' + (error.response?.data?.message || error.message || 'Erro desconhecido'));
    } finally {
      setSavingEdit(false);
    }
  };

  /**
   * Inicia uma sessão de impersonation como aluno
   */
  const handleImpersonate = async (aluno) => {
    try {
      setLoading(true);
      const timestamp = new Date().toLocaleString();
      console.log(`[${timestamp}] 👁️ Iniciando impersonation para aluno:`, {
        id: aluno.id,
        nome: aluno.nome,
        administrador: localStorage.getItem('userRole')
      });
      
      const response = await authService.startImpersonation(aluno.id);
      console.log(`[${timestamp}] ✅ Impersonation iniciado com sucesso para aluno ID ${aluno.id}`);
      
      // Aguarda um pequeno intervalo para garantir que o token foi processado
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Força uma atualização do token no Axios antes de redirecionar
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      }
      
      // Redireciona para a dashboard do aluno
      window.location.href = '/aluno/dashboard';
    } catch (error) {
      console.error('Erro ao impersonar aluno:', error);
      setError(error.response?.data?.message || 'Erro ao acessar como aluno. Por favor, tente novamente.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Cadastrar Aluno</h1>
      
      {/* Toast de erro para feedback sobre email/CPF duplicados */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          marginLeft: '110px', /* Metade da largura da sidebar (220px/2) para compensar o deslocamento */
          background: '#222',
          color: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px #0006',
          padding: '16px 32px 12px 20px',
          minWidth: 320,
          maxWidth: '90vw',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          fontSize: 18,
          fontWeight: 500
        }}>
          <span style={{fontSize: 24, marginRight: 12}}>⚠️</span>
          <span>Já existe um aluno cadastrado com este email ou CPF</span>
          <span style={{position: 'absolute', top: 8, right: 12, cursor: 'pointer', fontSize: 20}} onClick={() => setShowToast(false)}>&times;</span>
          <div style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: 4,
            width: '100%',
            background: '#dc2626',
            animation: 'toast-bar 3s linear'
          }} />
          <style>
            {`@keyframes toast-bar { from { width: 100%; } to { width: 0; } }`}
          </style>
        </div>
      )}
      
      {/* Banner de erro para outros tipos de erro */}
      {error && !error.includes('Já existe um aluno cadastrado com este email ou CPF') && (
        <div className={styles.error}>
          <p><strong>Erro:</strong> {error}</p>
          <p>Por favor, verifique os dados e tente novamente.</p>
        </div>
      )}
      
      {/* Modal de senha */}
      {showSenhaModal && alunoParaSenha && (
        <SenhaModal 
          aluno={alunoParaSenha} 
          onClose={handleCloseSenhaModal} 
        />
      )}
      
      {/* Formulário de cadastro de aluno */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2>Dados do Aluno</h2>
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite o nome completo"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Digite o e-mail"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
              placeholder="Digite o CPF"
              maxLength="14"
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Seção de associação com plano */}
        <div className={styles.formSection}>
          <h2>Associação de Plano</h2>
          
          <div className={styles.planoCheck}>
            <input
              type="checkbox"
              id="associarPlano"
              checked={associarPlano}
              onChange={() => {
                setAssociarPlano(!associarPlano);
                if (!associarPlano) setAssociarPlanoMestre(false);
              }}
              disabled={loading}
            />
            <label htmlFor="associarPlano">Associar aluno a um plano existente</label>
          </div>
          
          <div className={styles.planoCheck}>
            <input
              type="checkbox"
              id="associarPlanoMestre"
              checked={associarPlanoMestre}
              onChange={() => {
                setAssociarPlanoMestre(!associarPlanoMestre);
                if (!associarPlanoMestre) setAssociarPlano(false);
              }}
              disabled={loading}
            />
            <label htmlFor="associarPlanoMestre">Criar plano personalizado a partir de um plano mestre</label>
          </div>
          
          {associarPlano && (
            <div className={styles.planoForm}>
              <div className={styles.formGroup}>
                <label htmlFor="planoId">Plano</label>
                {loadingPlanos ? (
                  <div>Carregando planos...</div>
                ) : (
                  <select
                    id="planoId"
                    name="planoId"
                    value={planoData.planoId}
                    onChange={handlePlanoChange}
                    required={associarPlano}
                    disabled={loading}
                  >
                    <option value="">Selecione um plano</option>
                    {planos.map(plano => (
                      <option key={plano.id} value={plano.id}>
                        {plano.nome} - {plano.cargo} ({plano.duracao} meses)
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="dataInicio">Data de Início</label>
                <input
                  type="date"
                  id="dataInicio"
                  name="dataInicio"
                  value={planoData.dataInicio}
                  onChange={handlePlanoChange}
                  required={associarPlano}
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={planoData.status}
                  onChange={handlePlanoChange}
                  required={associarPlano}
                  disabled={loading}
                >
                  <option value="não iniciado">Não iniciado</option>
                  <option value="em andamento">Em andamento</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="observacoes">Observações</label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={planoData.observacoes}
                  onChange={handlePlanoChange}
                  placeholder="Observações sobre o aluno ou o plano (opcional)"
                  disabled={loading}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          {associarPlanoMestre && (
            <div className={styles.planoForm}>
              <div className={styles.formGroup}>
                <label htmlFor="planoMestreId">Plano Mestre</label>
                {loadingPlanosMestre ? (
                  <div>Carregando planos mestre...</div>
                ) : (
                  <select
                    id="planoMestreId"
                    name="planoMestreId"
                    value={planoMestreData.planoMestreId}
                    onChange={handlePlanoMestreChange}
                    required={associarPlanoMestre}
                    disabled={loading}
                  >
                    <option value="">Selecione um plano mestre</option>
                    {planosMestre.map(planoMestre => (
                      <option key={planoMestre.id} value={planoMestre.id}>
                        {planoMestre.nome} - {planoMestre.cargo}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="dataInicioMestre">Data de Início</label>
                <input
                  type="date"
                  id="dataInicioMestre"
                  name="dataInicio"
                  value={planoMestreData.dataInicio}
                  onChange={handlePlanoMestreChange}
                  required={associarPlanoMestre}
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="statusMestre">Status</label>
                <select
                  id="statusMestre"
                  name="status"
                  value={planoMestreData.status}
                  onChange={handlePlanoMestreChange}
                  required={associarPlanoMestre}
                  disabled={loading}
                >
                  <option value="não iniciado">Não iniciado</option>
                  <option value="em andamento">Em andamento</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="observacoesMestre">Observações</label>
                <textarea
                  id="observacoesMestre"
                  name="observacoes"
                  value={planoMestreData.observacoes}
                  onChange={handlePlanoMestreChange}
                  placeholder="Observações sobre o aluno ou o plano personalizado (opcional)"
                  disabled={loading}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Aluno'}
          </button>
          <button
            type="button"
            onClick={() => setShowList(!showList)}
            className={styles.listButton}
            disabled={loading}
          >
            {showList ? 'Ocultar Lista' : 'Listar Alunos'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Tabela de listagem de alunos */}
      {showList && (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Lista de Alunos</h2>
            
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Buscar por nome, email, CPF ou plano..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button 
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                  title="Limpar busca"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          {/* Lista de alunos com paginação */}
          {loadingAlunos ? (
            <div className={styles.loading}>Carregando alunos...</div>
          ) : filteredAlunos.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {searchTerm
                  ? `Nenhum aluno encontrado para "${searchTerm}".`
                  : 'Nenhum aluno cadastrado.'
                }
              </p>
              {searchTerm && (
                <button 
                  className={styles.clearFilterButton}
                  onClick={() => setSearchTerm('')}
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>CPF</th>
                    <th>Plano</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAlunos.map((aluno) => (
                    <tr key={aluno.id}>
                      <td dangerouslySetInnerHTML={{ 
                        __html: highlightMatch(aluno.nome, searchTerm) 
                      }} />
                      <td dangerouslySetInnerHTML={{ 
                        __html: highlightMatch(aluno.email, searchTerm) 
                      }} />
                      <td dangerouslySetInnerHTML={{ 
                        __html: highlightMatch(aluno.cpf, searchTerm) 
                      }} />
                      <td>
                        {associacoesAlunos[Number(aluno.id)] && associacoesAlunos[Number(aluno.id)].length > 0 ? (
                          <div className={styles.planosAluno}>
                            {associacoesAlunos[Number(aluno.id)].map((assoc, index) => (
                              <div key={index} className={styles.planoItem}>
                                <span className={styles.planoNome} dangerouslySetInnerHTML={{ 
                                  __html: highlightMatch(assoc.planoNome, searchTerm) 
                                }} />
                                <span 
                                  className={`${styles.statusIndicator} ${styles[`status${assoc.status.replace(/\s+/g, '')}`]}`} 
                                  title={assoc.status}
                                ></span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className={styles.semPlano}>Sem plano</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button onClick={() => handleEditarAluno(aluno)} className={styles.editBtn} title="Editar aluno">
                          Editar
                        </button>
                          <button 
                            onClick={() => handleImpersonate(aluno)} 
                            className={styles.impersonateBtn}
                            title="Acessar como este aluno"
                          >
                            👁️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Componente de paginação */}
              {pageCount > 1 && (
                <div className={styles.paginationContainer}>
                  <ReactPaginate
                    previousLabel={"← Anterior"}
                    nextLabel={"Próximo →"}
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                    containerClassName={styles.pagination}
                    previousLinkClassName={styles.paginationLink}
                    nextLinkClassName={styles.paginationLink}
                    disabledClassName={styles.paginationDisabled}
                    activeClassName={styles.paginationActive}
                    forcePage={currentPage}
                    pageRangeDisplayed={3}
                    marginPagesDisplayed={1}
                    breakLabel={"..."}
                    breakClassName={styles.paginationBreak}
                  />
                  <div className={styles.paginationInfo}>
                    Mostrando {filteredAlunos.length > 0 ? currentPage * itemsPerPage + 1 : 0} a {Math.min((currentPage + 1) * itemsPerPage, filteredAlunos.length)} de {filteredAlunos.length} alunos
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {/* Modal de edição de aluno */}
      <AlunoEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aluno={alunoEditando}
        planos={planos}
        onSave={handleSalvarEdicao}
        loading={savingEdit}
      />
    </div>
  );
}