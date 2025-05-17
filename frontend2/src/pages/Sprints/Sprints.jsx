import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sprints.module.css';
import { sprintService } from '../../services/sprintService';

/**
 * Componente Sprints
 * Exibe a listagem de todas as sprints cadastradas
 */
export default function Sprints() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSprints();
  }, []);

  /**
   * Busca todas as sprints do backend
   */
  const fetchSprints = async () => {
    try {
      setLoading(true);
      console.log('Buscando sprints...');
      const data = await sprintService.listarSprints();
      console.log('Sprints recebidas:', data);
      setSprints(Array.isArray(data) ? data : []);
      setError('');
    } catch (error) {
      console.error('Erro ao buscar sprints:', error);
      setError(error.message || 'Erro ao carregar sprints');
      setSprints([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navega para a página de cadastro de sprint
   */
  const handleRegisterClick = () => {
    navigate('/sprints/cadastrar');
  };

  /**
   * Navega para a página de edição de sprint
   * @param {number} sprintId - ID da sprint a ser editada
   */
  const handleEditClick = (sprintId) => {
    navigate(`/sprints/editar/${sprintId}`);
  };

  if (loading) {
    return <div className={styles.loading}>Carregando sprints...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Sprints Cadastradas</h1>
        <button 
          className={styles.registerButton}
          onClick={handleRegisterClick}
        >
          + Nova Sprint
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={fetchSprints}>Tentar novamente</button>
        </div>
      )}

      {!error && sprints.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhuma sprint encontrada. Clique em "Nova Sprint" para criar.</p>
        </div>
      )}

      <div className={styles.sprintsList}>
        {sprints.map((sprint) => (
          <div key={sprint.id} className={styles.sprintCard}>
            <div className={styles.sprintHeader}>
              <div className={styles.sprintTitleContainer}>
                <h2>{sprint.nome}</h2>
                <span className={styles.date}>
                  {new Date(sprint.dataInicio).toLocaleDateString()} - {new Date(sprint.dataFim).toLocaleDateString()}
                </span>
              </div>
              <button 
                className={styles.editButton}
                onClick={() => handleEditClick(sprint.id)}
                title="Editar sprint"
              >
                ✏️
              </button>
            </div>
            
            <div className={styles.activities}>
              <h3>Atividades</h3>
              {sprint.atividades && sprint.atividades.length > 0 ? (
                <ul>
                  {sprint.atividades.map((atividade) => (
                    <li key={atividade.id} className={styles.activityItem}>
                      <div className={styles.activityInfo}>
                        <span className={styles.discipline}>{atividade.disciplina}</span>
                        <span className={styles.title}>{atividade.titulo}</span>
                      </div>
                      <div className={styles.activityDetails}>
                        <span className={styles.type}>{atividade.tipo}</span>
                        <span className={styles.relevance}>
                          {'★'.repeat(atividade.relevancia || 0)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noActivities}>Nenhuma atividade cadastrada para esta sprint.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 