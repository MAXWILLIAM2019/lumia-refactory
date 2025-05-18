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
   * Agrupa sprints por plano e preserva a ordem
   */
  const getSprintsByPlano = () => {
    const planos = {};
    
    sprints.forEach(sprint => {
      const planoId = sprint.PlanoId;
      const planoNome = sprint.Plano?.nome || 'Sem Plano';
      
      if (!planos[planoId]) {
        planos[planoId] = {
          id: planoId,
          nome: planoNome,
          sprints: []
        };
      }
      
      planos[planoId].sprints.push(sprint);
    });
    
    return Object.values(planos);
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

  const planosList = getSprintsByPlano();

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

      {planosList.map(plano => (
        <div key={plano.id} className={styles.planoSection}>
          <h2 className={styles.planoTitle}>
            {plano.nome}
          </h2>
          <div className={styles.sprintsList}>
            {plano.sprints.map((sprint, index) => (
              <div key={sprint.id} className={styles.sprintCard}>
                <div className={styles.sequenceIndicator}>
                  {index + 1}
                </div>
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
                  <h3>Metas</h3>
                  {sprint.metas && sprint.metas.length > 0 ? (
                    <ul>
                      {sprint.metas.map((meta) => (
                        <li key={meta.id} className={styles.activityItem}>
                          <div className={styles.activityInfo}>
                            <span className={styles.discipline}>{meta.disciplina}</span>
                            <span className={styles.title}>{meta.titulo}</span>
                          </div>
                          <div className={styles.activityDetails}>
                            <span className={styles.type}>{meta.tipo}</span>
                            <span className={styles.relevance}>
                              {'★'.repeat(meta.relevancia || 0)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.noActivities}>Nenhuma meta cadastrada para esta sprint.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 