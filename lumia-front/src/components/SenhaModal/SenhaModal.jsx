import { useState } from 'react';
import styles from './SenhaModal.module.css';
import { alunoService } from '../../services/alunoService';

/**
 * Modal para definição de senha de aluno
 * Permite definir uma senha manualmente ou gerar uma senha automática
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.aluno - Dados do aluno
 * @param {Function} props.onClose - Função chamada ao fechar o modal
 */
const SenhaModal = ({ aluno, onClose }) => {
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [senhaGerada, setSenhaGerada] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modo, setModo] = useState('manual'); // 'manual' ou 'automatica'
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false);
  const [senhaCopiada, setSenhaCopiada] = useState(false);

  /**
   * Gera uma senha aleatória para o aluno
   */
  const handleGerarSenha = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await alunoService.gerarSenha(aluno.id);
      setSenhaGerada(response.senha);
      setModo('automatica');
      
    } catch (error) {
      setError(error.message || 'Erro ao gerar senha');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Define uma senha manual para o aluno
   */
  const handleDefinirSenha = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validações básicas
      if (senha.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
      
      if (senha !== confirmacaoSenha) {
        setError('As senhas não conferem');
        return;
      }
      
      await alunoService.definirSenha(aluno.id, senha);
      alert('Senha definida com sucesso!');
      onClose();
      
    } catch (error) {
      setError(error.message || 'Erro ao definir senha');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Salva a senha gerada automaticamente
   */
  const handleSalvarSenhaGerada = async () => {
    try {
      setLoading(true);
      setError('');
      
      await alunoService.definirSenha(aluno.id, senhaGerada);
      alert('Senha definida com sucesso!');
      onClose();
      
    } catch (error) {
      setError(error.message || 'Erro ao definir senha');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copia a senha gerada para a área de transferência
   */
  const handleCopiarSenha = () => {
    navigator.clipboard.writeText(senhaGerada)
      .then(() => {
        setSenhaCopiada(true);
        setTimeout(() => setSenhaCopiada(false), 2000);
      })
      .catch(() => {
        setError('Erro ao copiar senha. Tente selecionar e copiar manualmente.');
      });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Definir Senha para o Aluno</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.alunoDados}>
            <strong>Aluno:</strong> {aluno.nome}<br />
            <strong>Email:</strong> {aluno.email}
          </p>
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <div className={styles.modoSelecao}>
            <button 
              className={`${styles.modoButton} ${modo === 'manual' ? styles.ativo : ''}`}
              onClick={() => setModo('manual')}
              disabled={loading}
            >
              Definir senha manualmente
            </button>
            <button 
              className={`${styles.modoButton} ${modo === 'automatica' ? styles.ativo : ''}`}
              onClick={handleGerarSenha}
              disabled={loading}
            >
              Gerar senha automaticamente
            </button>
          </div>
          
          {modo === 'manual' ? (
            <div className={styles.formSenha}>
              <div className={styles.inputGroup}>
                <label htmlFor="senha">Senha</label>
                <div className={styles.inputComVisualizacao}>
                  <input
                    type={senhaVisivel ? "text" : "password"}
                    id="senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite a senha"
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    className={styles.toggleSenha}
                    onClick={() => setSenhaVisivel(!senhaVisivel)}
                    aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {senhaVisivel ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="confirmacaoSenha">Confirmar Senha</label>
                <div className={styles.inputComVisualizacao}>
                  <input
                    type={confirmacaoVisivel ? "text" : "password"}
                    id="confirmacaoSenha"
                    value={confirmacaoSenha}
                    onChange={(e) => setConfirmacaoSenha(e.target.value)}
                    placeholder="Confirme a senha"
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    className={styles.toggleSenha}
                    onClick={() => setConfirmacaoVisivel(!confirmacaoVisivel)}
                    aria-label={confirmacaoVisivel ? "Ocultar confirmação" : "Mostrar confirmação"}
                  >
                    {confirmacaoVisivel ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              <div className={styles.dicas}>
                <p>A senha deve ter pelo menos 6 caracteres.</p>
              </div>
              
              <button 
                className={styles.salvarButton}
                onClick={handleDefinirSenha}
                disabled={loading || !senha || !confirmacaoSenha}
              >
                {loading ? 'Salvando...' : 'Salvar Senha'}
              </button>
            </div>
          ) : (
            <div className={styles.senhaGeradaContainer}>
              {senhaGerada ? (
                <>
                  <div className={styles.senhaGeradaBox}>
                    <div className={styles.senhaGeradaLabel}>Senha gerada:</div>
                    <div className={styles.senhaGerada}>{senhaGerada}</div>
                    <button 
                      className={styles.copiarButton}
                      onClick={handleCopiarSenha}
                      disabled={loading}
                    >
                      {senhaCopiada ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  
                  <div className={styles.dicas}>
                    <p><strong>ATENÇÃO:</strong> Anote esta senha, pois ela não poderá ser recuperada depois.</p>
                  </div>
                  
                  <button 
                    className={styles.salvarButton}
                    onClick={handleSalvarSenhaGerada}
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar Senha Gerada'}
                  </button>
                </>
              ) : (
                <div className={styles.carregando}>
                  {loading ? 'Gerando senha...' : 'Clique em "Gerar senha automaticamente" para gerar uma senha'}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelarButton}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SenhaModal; 