import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../RegisterPlan/RegisterPlan.module.css';
import { sprintService } from '../../services/sprintService';
import { planoService } from '../../services/planoService';
import addSprintIcon from '../../assets/icons/add-sprint.svg';
import registerSprintIcon from '../../assets/icons/register-sprint.svg';
import editDisciplineIcon from '../../assets/icons/edit-discipline.svg';
import deletePlanIcon from '../../assets/icons/delete-plan.svg';

export default function PlanSprints() {
  const { id } = useParams();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [planoNome, setPlanoNome] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        setLoading(true);
        const data = await sprintService.listarSprintsPorPlano(id);
        console.log('Dados das sprints:', data);
        setSprints(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        console.error('Erro ao carregar sprints:', err);
        setError('Erro ao carregar sprints do plano.');
        setSprints([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSprints();
  }, [id]);

  useEffect(() => {
    const fetchPlano = async () => {
      try {
        const plano = await planoService.buscarPlanoPorId(id);
        setPlanoNome(plano?.nome || '');
      } catch {
        setPlanoNome('');
      }
    };
    fetchPlano();
  }, [id]);

  const handleVisualizar = (sprintId) => {
    navigate(`/sprints/${sprintId}`);
  };

  const handleEditar = (sprintId) => {
    navigate(`/sprints/editar/${sprintId}`);
  };

  const handleExcluir = async (sprintId) => {
    if (window.confirm('Tem certeza que deseja excluir esta sprint?')) {
      try {
        await sprintService.excluirSprint(sprintId);
        setSprints(sprints.filter(sprint => sprint.id !== sprintId));
      } catch (error) {
        setError('Erro ao excluir sprint. Tente novamente.');
      }
    }
  };

  const NovoSprintCard = (
    <div className={styles.novoPlanoCard} onClick={() => navigate(`/sprints/cadastrar/${id}`)}>
      <div className={styles.novoPlanoIcon}>
        <img src={addSprintIcon} alt="Criar Nova Sprint" width={32} height={32} />
      </div>
      <div>
        <h2>Criar Nova Sprint</h2>
      </div>
    </div>
  );

  const SprintCard = (sprint) => {
    console.log('Dados da sprint:', sprint); // Log para debug
    return (
      <div className={styles.planoCard} key={sprint.id}>
        <div className={styles.planoCardHeader}>
          <div className={styles.planoCardLogo}></div>
          <div>
            <h2 className={styles.planoCardTitle}>{sprint.nome}</h2>
            <p className={styles.planoCardDescription} style={{ color: '#666' }}>
              Metas: {sprint.metas ? sprint.metas.length : 0}
            </p>
          </div>
        </div>
        <div className={styles.planoCardActions}>
          <button 
            className={styles.actionButton}
            onClick={() => handleVisualizar(sprint.id)}
          >
            <img src={addSprintIcon} alt="Visualizar" width={24} height={24} style={{ marginRight: '8px' }} />
            <span>Visualizar</span>
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => handleEditar(sprint.id)}
          >
            <img src={editDisciplineIcon} alt="Editar" width={24} height={24} style={{ marginRight: '8px' }} />
            <span>Editar</span>
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => handleExcluir(sprint.id)}
          >
            <img src={deletePlanIcon} alt="Excluir" width={24} height={24} style={{ marginRight: '8px' }} />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1>{planoNome ? `${planoNome} → Sprints` : 'Sprints'}</h1>
      <div className={styles.tabsUnderline}></div>
      {error && <div className={styles.error}>{error}</div>}
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className={styles.cardsGrid}>
          {[NovoSprintCard, ...sprints.map(SprintCard)]}
        </div>
      )}
    </div>
  );
} 