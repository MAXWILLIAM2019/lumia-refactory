import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterPlan.module.css';
import { planoService } from '../../services/planoService';
import { disciplinaService } from '../../services/disciplinaService';
import { sprintService } from '../../services/sprintService';
import registerSprintIcon from '../../assets/icons/register-sprint.svg';
import editIcon from '../../assets/icons/edit.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import addSprintIcon from '../../assets/icons/add-sprint.svg';
import editDisciplineIcon from '../../assets/icons/edit-discipline.svg';
import deletePlanIcon from '../../assets/icons/delete-plan.svg';

// Log para depuração
console.log('RegisterPlan - Token:', localStorage.getItem('token'));

export default function RegisterPlan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: '',
    cargo: '',
    disciplinas: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [disciplinasAtivas, setDisciplinasAtivas] = useState([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [planos, setPlanos] = useState([]);
  const [sprintsPorPlano, setSprintsPorPlano] = useState({});
  const [showForm, setShowForm] = useState(false);
  const dropdownRef = useRef(null);

  // Carregar disciplinas ativas ao montar o componente
  useEffect(() => {
    const fetchDisciplinasAtivas = async () => {
      try {
        setLoadingDisciplinas(true);
        const disciplinas = await disciplinaService.listarDisciplinasAtivas();
        console.log('Disciplinas ativas carregadas:', disciplinas);
        setDisciplinasAtivas(disciplinas);
      } catch (error) {
        console.error('Erro ao carregar disciplinas ativas:', error);
        setError('Não foi possível carregar as disciplinas. Por favor, tente novamente.');
      } finally {
        setLoadingDisciplinas(false);
      }
    };

    fetchDisciplinasAtivas();
  }, []);

  // Carregar planos cadastrados e sprints de cada plano
  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        setLoading(true);
        const data = await planoService.listarPlanos();
        setPlanos(data);
        // Buscar sprints de cada plano
        const sprintsPromises = data.map(async (plano) => {
          try {
            const resp = await sprintService.listarSprintsPorPlano(plano.id);
            return { planoId: plano.id, count: Array.isArray(resp) ? resp.length : 0 };
          } catch {
            return { planoId: plano.id, count: 0 };
          }
        });
        const sprintsCounts = await Promise.all(sprintsPromises);
        const sprintsMap = {};
        sprintsCounts.forEach(({ planoId, count }) => {
          sprintsMap[planoId] = count;
        });
        setSprintsPorPlano(sprintsMap);
      } catch (error) {
        setError('Erro ao carregar planos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlanos();
  }, [success]);

  // Fechar o dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Redirecionar após cadastro bem-sucedido
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setShowForm(false);
        setSuccess('');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Garantir que o token esteja disponível antes de navegar
  useEffect(() => {
    // Verifica se o token está presente
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDisciplineSelect = (disciplineId) => {
    setSelectedDiscipline(disciplineId);
    setIsDropdownOpen(false);
  };

  const handleAddDiscipline = () => {
    if (selectedDiscipline && !selectedDisciplines.some(d => d.id.toString() === selectedDiscipline)) {
      // Encontra a disciplina selecionada no array de disciplinas ativas
      const disciplinaObj = disciplinasAtivas.find(d => d.id.toString() === selectedDiscipline);
      
      if (disciplinaObj) {
        // Adiciona a disciplina diretamente com seus assuntos pré-cadastrados
        setSelectedDisciplines(prev => [...prev, {
          id: disciplinaObj.id,
          nome: disciplinaObj.nome,
          assuntos: disciplinaObj.assuntos || []
        }]);
        
        // Limpar o valor selecionado
        setSelectedDiscipline('');
      }
    }
  };

  const removeDiscipline = (discipline) => {
    setSelectedDisciplines(prev => prev.filter(d => d.id !== discipline.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const dataToSubmit = {
        ...formData,
        disciplinas: selectedDisciplines
      };
      console.log('1. Dados do plano antes de enviar:', dataToSubmit);
      console.log('2. Verificando estrutura dos dados:');
      console.log('- Nome:', dataToSubmit.nome);
      console.log('- Cargo:', dataToSubmit.cargo);
      console.log('- Descrição:', dataToSubmit.descricao);
      console.log('- Duração:', dataToSubmit.duracao);
      console.log('- Disciplinas:', dataToSubmit.disciplinas);
      
      await planoService.cadastrarPlano(dataToSubmit);
      console.log('3. Plano cadastrado com sucesso');
      
      // Define a mensagem de sucesso e deixa o redirecionamento para o useEffect
      setSuccess('Plano cadastrado com sucesso! Redirecionando...');
      
      // Limpa o formulário
      setFormData({
        nome: '',
        descricao: '',
        duracao: '',
        cargo: '',
        disciplinas: []
      });
      setSelectedDisciplines([]);
    } catch (error) {
      console.error('4. Erro detalhado ao cadastrar plano:', error);
      console.error('5. Mensagem de erro:', error.message);
      console.error('6. Stack trace:', error.stack);
      setError(error.message || 'Erro ao cadastrar plano. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Encontrar o nome da disciplina selecionada
  const getSelectedDisciplineName = () => {
    if (!selectedDiscipline) return 'Selecione uma disciplina';
    const disciplina = disciplinasAtivas.find(d => d.id.toString() === selectedDiscipline);
    return disciplina ? disciplina.nome : 'Selecione uma disciplina';
  };

  // Filtrar disciplinas que não foram selecionadas ainda
  const availableDisciplines = disciplinasAtivas
    .filter(disciplina => !selectedDisciplines.some(d => d.id === disciplina.id));

  // Card de criar novo plano
  const NovoPlanoCard = (
    <div className={styles.novoPlanoCard} onClick={() => setShowForm(true)}>
      <div className={styles.novoPlanoIcon}>+</div>
      <div>
        <h2>Criar Novo Plano</h2>
      </div>
    </div>
  );

  // Card de plano já cadastrado
  const PlanoCard = (plano) => (
    <div className={styles.planoCard} key={plano.id}>
      <div className={styles.planoCardHeader}>
        <div className={styles.planoCardLogo}></div>
        <div>
          <h2 className={styles.planoCardTitle}>{plano.nome}</h2>
          <div className={styles.planoCardInfo}>
            <span>Sprints: {sprintsPorPlano[plano.id] ?? '-'}</span>
            <span>Disciplinas: {plano.disciplinas?.length || 0}</span>
            <span>Tópicos: {plano.disciplinas?.reduce((acc, d) => acc + (d.assuntos?.length || 0), 0)}</span>
          </div>
        </div>
      </div>
      <div className={styles.planoCardFooter}></div>
      <div className={styles.planoCardActions}>
        <button className={styles.actionButton + ' ' + styles.cadastrarSprint} onClick={() => navigate(`/planos/${plano.id}/sprints`)}>
          <img src={addSprintIcon} alt="Sprints" width={24} height={24} />
          <span>Sprints</span>
        </button>
        <button className={styles.actionButton + ' ' + styles.editarDisciplina}>
          <img src={editDisciplineIcon} alt="Editar" width={24} height={24} />
          <span>Editar</span>
        </button>
        <button className={styles.actionButton + ' ' + styles.excluirPlano}>
          <img src={deletePlanIcon} alt="Excluir" width={24} height={24} />
          <span>Excluir</span>
        </button>
      </div>
    </div>
  );

  // Layout dos cards em linhas de 3
  const cards = [NovoPlanoCard, ...planos.map(PlanoCard)];

  return (
    <div className={styles.container}>
      <h1>Planos</h1>
      <div className={styles.tabsUnderline}></div>
      
      {!showForm ? (
        <div className={styles.cardsGrid}>
          {cards}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <p>Erro: {error}</p>
              <p>Por favor, verifique os dados e tente novamente.</p>
            </div>
          )}
          
          {success && (
            <div className={styles.success}>
              <p>{success}</p>
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome do Plano</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite o nome do plano"
              disabled={loading || !!success}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cargo">Cargo</label>
            <input
              type="text"
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
              placeholder="Digite o cargo"
              disabled={loading || !!success}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              placeholder="Digite a descrição do plano"
              disabled={loading || !!success}
              rows="4"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="duracao">Duração (meses)</label>
            <input
              type="number"
              id="duracao"
              name="duracao"
              value={formData.duracao}
              onChange={handleChange}
              required
              placeholder="Digite a duração em meses"
              min="1"
              disabled={loading || !!success}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Disciplinas</label>
            <div className={styles.disciplineSelector}>
              <div className={styles.customDropdown} ref={dropdownRef}>
                <div 
                  className={styles.dropdownHeader} 
                  onClick={toggleDropdown}
                  tabIndex="0"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  disabled={loading || !!success}
                >
                  {getSelectedDisciplineName()}
                </div>
                
                {isDropdownOpen && (
                  <ul className={styles.dropdownList}>
                    {loadingDisciplinas ? (
                      <li className={styles.dropdownItem}>
                        Carregando disciplinas...
                      </li>
                    ) : availableDisciplines.length > 0 ? (
                      availableDisciplines.map(disciplina => (
                        <li 
                          key={disciplina.id} 
                          className={styles.dropdownItem}
                          onClick={() => handleDisciplineSelect(disciplina.id.toString())}
                          aria-selected={selectedDiscipline === disciplina.id.toString()}
                          role="option"
                        >
                          {disciplina.nome}
                        </li>
                      ))
                    ) : (
                      <li className={styles.dropdownItem}>
                        Nenhuma disciplina ativa disponível
                      </li>
                    )}
                  </ul>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleAddDiscipline}
                disabled={loading || !selectedDiscipline || !!success}
                className={styles.addDisciplineButton}
              >
                +
              </button>
            </div>
          </div>

          {selectedDisciplines.length > 0 && (
            <div className={styles.selectedDisciplines}>
              <h3>Disciplinas Selecionadas</h3>
              <div className={styles.disciplinesList}>
                {selectedDisciplines.map(discipline => (
                  <div key={discipline.id} className={styles.selectedDiscipline}>
                    <div className={styles.disciplineInfo}>
                      <span className={styles.disciplineName}>{discipline.nome}</span>
                      <span className={styles.assuntosCount}>
                        {discipline.assuntos.length} {discipline.assuntos.length === 1 ? 'assunto' : 'assuntos'}
                      </span>
                    </div>
                    <div className={styles.disciplineActions}>
                      <button
                        type="button"
                        onClick={() => removeDiscipline(discipline)}
                        className={styles.removeDisciplineButton}
                        disabled={loading || !!success}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading || !!success}
            >
              {loading ? 'Cadastrando...' : success ? 'Cadastrado' : 'Cadastrar Plano'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={styles.cancelButton}
              disabled={loading || !!success}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 