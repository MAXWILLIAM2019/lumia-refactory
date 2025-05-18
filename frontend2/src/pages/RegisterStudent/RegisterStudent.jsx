/**
 * Componente de Cadastro e Listagem de Alunos
 * 
 * Este componente implementa:
 * - Formulário para cadastro de novos alunos
 * - Associação do aluno a um plano
 * - Interface para visualização da lista de alunos cadastrados
 * - Tratamento de erros e feedback ao usuário
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { alunoService } from '../../services/alunoService';
import { alunoPlanoService } from '../../services/alunoPlanoService';
import api from '../../services/api';
import styles from './RegisterStudent.module.css';

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
  
  // Estados de controle da UI
  const [loading, setLoading] = useState(false);
  const [loadingPlanos, setLoadingPlanos] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeout = useRef(null);
  const [alunos, setAlunos] = useState([]);
  const [showList, setShowList] = useState(false);

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
      console.log('Tentando carregar lista de alunos...');
      const data = await alunoService.listarAlunos();
      console.log('Dados recebidos:', data);
      
      // Garante que data é sempre um array, mesmo se a API retornar null/undefined
      setAlunos(Array.isArray(data) ? data : []);
      
      // Limpa qualquer erro anterior se a requisição for bem-sucedida
      if (error) setError('');
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setError(error.message || 'Erro ao carregar lista de alunos');
      // Inicializa alunos como array vazio em caso de erro
      setAlunos([]);
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
   * Atualiza o estado do formulário quando o usuário digita
   * @param {Event} e - Evento de mudança do input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
   * Submete o formulário para cadastrar um novo aluno
   * @param {Event} e - Evento de submit do formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Enviando dados:', formData);
      const alunoResponse = await alunoService.cadastrarAluno(formData);
      console.log('Resposta do servidor (aluno):', alunoResponse);
      
      // Se for para associar a um plano, faz isso após cadastrar o aluno
      if (associarPlano && planoData.planoId) {
        console.log('Associando aluno ao plano:', {
          alunoId: alunoResponse.id,
          ...planoData
        });
        
        try {
          const associacaoResponse = await alunoPlanoService.atribuirPlano({
            alunoId: alunoResponse.id,
            ...planoData
          });
          console.log('Resposta do servidor (associação):', associacaoResponse);
          alert('Aluno cadastrado e associado ao plano com sucesso!');
        } catch (associacaoError) {
          console.error('Erro ao associar aluno ao plano:', associacaoError);
          alert(`Aluno cadastrado com sucesso, mas não foi possível associá-lo ao plano. Motivo: ${associacaoError.message}`);
        }
      } else {
        alert('Aluno cadastrado com sucesso!');
      }
      
      // Limpa o formulário
      setFormData({ nome: '', email: '', cpf: '' });
      setPlanoData({
        planoId: '',
        dataInicio: new Date().toISOString().split('T')[0],
        status: 'não iniciado',
        observacoes: ''
      });
      setAssociarPlano(false);
      
      // Atualiza a lista de alunos se estiver visível
      if (showList) {
        carregarAlunos();
      }
    } catch (error) {
      console.error('Erro detalhado:', error);
      setError(error.message || 'Erro ao cadastrar aluno. Tente novamente.');
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
          <div className={styles.planoCheck}>
            <input
              type="checkbox"
              id="associarPlano"
              checked={associarPlano}
              onChange={() => setAssociarPlano(!associarPlano)}
              disabled={loading}
            />
            <label htmlFor="associarPlano">Associar aluno a um plano</label>
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
          <h2>Lista de Alunos</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>CPF</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.nome}</td>
                  <td>{aluno.email}</td>
                  <td>{aluno.cpf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}