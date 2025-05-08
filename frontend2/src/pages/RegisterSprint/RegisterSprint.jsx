import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './RegisterSprint.module.css';

const PREDEFINED_DISCIPLINES = [
  'Matemática',
  'Português',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Inglês',
  'Literatura',
  'Redação'
];

export default function RegisterSprint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    activities: [{ 
      discipline: '', 
      customDiscipline: '', 
      title: '',
      type: 'teoria', 
      relevance: 1
    }]
  });

  useEffect(() => {
    if (id) {
      fetchSprint();
    }
  }, [id]);

  const fetchSprint = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/sprints/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar sprint');
      }
      const sprint = await response.json();
      
      setFormData({
        title: sprint.nome,
        startDate: sprint.dataInicio,
        endDate: sprint.dataFim,
        activities: sprint.atividades.map(atividade => ({
          discipline: PREDEFINED_DISCIPLINES.includes(atividade.disciplina) ? atividade.disciplina : 'custom',
          customDiscipline: !PREDEFINED_DISCIPLINES.includes(atividade.disciplina) ? atividade.disciplina : '',
          title: atividade.titulo,
          type: atividade.tipo,
          relevance: atividade.relevancia
        }))
      });
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar sprint');
      navigate('/sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = id ? `http://localhost:3000/api/sprints/${id}` : 'http://localhost:3000/api/sprints';
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.title,
          dataInicio: formData.startDate,
          dataFim: formData.endDate,
          atividades: formData.activities.map(activity => ({
            disciplina: activity.discipline === 'custom' ? activity.customDiscipline : activity.discipline,
            tipo: activity.type,
            titulo: activity.title,
            relevancia: activity.relevance
          }))
        })
      });

      if (!response.ok) {
        throw new Error(id ? 'Erro ao atualizar sprint' : 'Erro ao criar sprint');
      }

      alert(id ? 'Sprint atualizada com sucesso!' : 'Sprint cadastrada com sucesso!');
      navigate('/sprints');
    } catch (error) {
      console.error('Erro:', error);
      alert(id ? 'Erro ao atualizar sprint. Tente novamente.' : 'Erro ao cadastrar sprint. Tente novamente.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActivityChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, { 
        discipline: '', 
        customDiscipline: '', 
        title: '',
        type: 'teoria', 
        relevance: 1
      }]
    }));
  };

  const removeActivity = (index) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className={styles.loading}>Carregando sprint...</div>;
  }

  return (
    <div className={`${styles.container} ${id ? styles.editMode : ''}`}>
      <h1>{id ? 'Editar Sprint' : 'Nova Sprint'}</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Nome da Sprint</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate">Data de Início</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endDate">Data de Término</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.activitiesSection}>
          <h2>Atividades</h2>
          {formData.activities.map((activity, index) => (
            <div key={index} className={styles.activityCard}>
              <div className={styles.activityHeader}>
                <h3>Atividade {index + 1}</h3>
                {formData.activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className={styles.removeButton}
                  >
                    Remover
                  </button>
                )}
              </div>

              <div className={styles.activityContent}>
                <div className={styles.formGroup}>
                  <label>Disciplina</label>
                  <select
                    value={activity.discipline}
                    onChange={(e) => handleActivityChange(index, 'discipline', e.target.value)}
                    required
                  >
                    <option value="">Selecione uma disciplina</option>
                    {PREDEFINED_DISCIPLINES.map(discipline => (
                      <option key={discipline} value={discipline}>
                        {discipline}
                      </option>
                    ))}
                    <option value="custom">Outra</option>
                  </select>
                </div>

                {activity.discipline === 'custom' && (
                  <div className={styles.formGroup}>
                    <label>Nome da Disciplina</label>
                    <input
                      type="text"
                      value={activity.customDiscipline}
                      onChange={(e) => handleActivityChange(index, 'customDiscipline', e.target.value)}
                      required
                      className={styles.customDisciplineField}
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>Título da Atividade</label>
                  <input
                    type="text"
                    value={activity.title}
                    onChange={(e) => handleActivityChange(index, 'title', e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tipo</label>
                  <select
                    value={activity.type}
                    onChange={(e) => handleActivityChange(index, 'type', e.target.value)}
                    required
                  >
                    <option value="teoria">Teoria</option>
                    <option value="exercicio">Exercício</option>
                    <option value="prova">Prova</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Relevância</label>
                  <div className={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.starButton} ${activity.relevance >= star ? styles.active : ''}`}
                        onClick={() => handleActivityChange(index, 'relevance', star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addActivity}
            className={styles.addButton}
          >
            + Adicionar Atividade
          </button>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            {id ? 'Salvar Alterações' : 'Cadastrar Sprint'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/sprints')}
            className={styles.listButton}
          >
            Listar Sprints
          </button>
          {id && (
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Tem certeza que deseja excluir esta sprint?')) {
                  try {
                    const response = await fetch(`http://localhost:3000/api/sprints/${id}`, {
                      method: 'DELETE'
                    });
                    if (!response.ok) {
                      throw new Error('Erro ao excluir sprint');
                    }
                    alert('Sprint excluída com sucesso!');
                    navigate('/sprints');
                  } catch (error) {
                    console.error('Erro:', error);
                    alert('Erro ao excluir sprint. Tente novamente.');
                  }
                }
              }}
              className={styles.deleteButton}
            >
              Excluir Sprint
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/sprints')}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
} 