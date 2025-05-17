import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sprintService } from '../../services/sprintService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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

const RegisterSprint = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(id ? true : false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [editorContent, setEditorContent] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    activities: [{ 
      discipline: '', 
      customDiscipline: '', 
      title: '',
      type: 'teoria', 
      relevance: 1,
      comandos: '',
      link: ''
    }]
  });

  // Configuração do editor Quill
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'code-block'
  ];

  useEffect(() => {
    if (id) {
      loadSprint();
    }
  }, [id]);

  const loadSprint = async () => {
    try {
      const sprint = await sprintService.buscarSprintPorId(id);
      setFormData({
        title: sprint.nome,
        startDate: sprint.dataInicio,
        endDate: sprint.dataFim,
        activities: sprint.atividades.map(atividade => ({
          discipline: atividade.disciplina,
          customDiscipline: '',
          title: atividade.titulo,
          type: atividade.tipo,
          relevance: atividade.relevancia,
          comandos: atividade.comandos || '',
          link: atividade.link || ''
        }))
      });
    } catch (error) {
      console.error('Erro ao carregar sprint:', error);
      alert('Erro ao carregar sprint. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const sprintData = {
        nome: formData.title,
        dataInicio: formData.startDate,
        dataFim: formData.endDate,
        atividades: formData.activities.map(activity => ({
          disciplina: activity.discipline === 'custom' ? activity.customDiscipline : activity.discipline,
          tipo: activity.type,
          titulo: activity.title,
          relevancia: activity.relevance,
          comandos: activity.comandos,
          link: activity.link
        }))
      };

      if (id) {
        await sprintService.atualizarSprint(id, sprintData);
        alert('Sprint atualizada com sucesso!');
      } else {
        await sprintService.cadastrarSprint(sprintData);
        alert('Sprint cadastrada com sucesso!');
      }
      
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
        relevance: 1,
        comandos: '',
        link: ''
      }]
    }));
  };

  const removeActivity = (index) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  const openTextEditor = (index, initialContent) => {
    setCurrentActivityIndex(index);
    setEditorContent(initialContent || '');
    setShowTextEditor(true);
  };

  const saveTextEditorContent = () => {
    // Obtenha o elemento ql-editor para verificar se o conteúdo está vazio
    const editorElement = document.querySelector('.ql-editor');
    
    // Se o conteúdo for apenas um parágrafo vazio <p><br></p>, considere-o como vazio
    const isEmpty = editorElement?.innerHTML === '<p><br></p>';
    
    // Salve o conteúdo apenas se não estiver vazio
    if (!isEmpty) {
      handleActivityChange(currentActivityIndex, 'comandos', editorContent);
    }
    
    setShowTextEditor(false);
  };

  if (loading) {
    return <div className={styles.loading}>Carregando sprint...</div>;
  }

  return (
    <div className={`${styles.container} ${id ? styles.editMode : ''}`}>
      {showTextEditor && (
        <div className={styles.modalOverlay}>
          <div className={styles.textEditorModal}>
            <div className={styles.textEditorHeader}>
              <h3>Editor de Texto - Comandos</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowTextEditor(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.textEditorContent}>
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
                placeholder="Digite as instruções ou comandos aqui..."
                id="textEditorArea"
              />
            </div>
            <div className={styles.textEditorFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowTextEditor(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.saveButton}
                onClick={saveTextEditorContent}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

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
            style={{ width: '100%', boxSizing: 'border-box' }}
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
              style={{ width: '100%', boxSizing: 'border-box' }}
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
              style={{ width: '100%', boxSizing: 'border-box' }}
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
                <div className={styles.activityRow}>
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
                      <option value="questoes">Questões</option>
                      <option value="revisao">Revisão</option>
                      <option value="reforco">Reforço</option>
                    </select>
                  </div>
                </div>

                <div className={styles.activityRow}>
                  <div className={styles.formGroup}>
                    <label>Comandos</label>
                    <div 
                      className={styles.commandsField}
                      onClick={() => openTextEditor(index, activity.comandos)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      {activity.comandos ? 
                        <div 
                          className={styles.commandsPreview}
                          dangerouslySetInnerHTML={{ __html: activity.comandos }}
                        /> : 
                        <div className={styles.commandsPlaceholder}>
                          Clique para adicionar instruções ou comandos específicos
                        </div>
                      }
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Link</label>
                    <input
                      type="url"
                      value={activity.link}
                      onChange={(e) => handleActivityChange(index, 'link', e.target.value)}
                      placeholder="URL de referência (opcional)"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
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
                    await sprintService.excluirSprint(id);
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
};

export default RegisterSprint; 