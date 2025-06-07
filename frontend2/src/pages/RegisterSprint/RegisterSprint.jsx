import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sprintService } from '../../services/sprintService';
import { planoService } from '../../services/planoService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './RegisterSprint.module.css';
import * as XLSX from 'xlsx';
import deleteMetasSprintIcon from '../../assets/icons/delete-metas-sprint.svg';

// Disciplinas predefinidas para fallback (serão usadas apenas se a API falhar)
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
  const { id, planoId } = useParams();
  const [loading, setLoading] = useState(id ? true : false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [editorContent, setEditorContent] = useState('');
  const [planos, setPlanos] = useState([]);
  const [loadingPlanos, setLoadingPlanos] = useState(true);
  const [disciplinasDoPlanoDisciplinas, setDisciplinasDoPlanoDisciplinas] = useState([]);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
  const [assuntosDaDisciplina, setAssuntosDaDisciplina] = useState({});
  const [showAssuntosDropdown, setShowAssuntosDropdown] = useState({});
  const [lastLoadedPlanoId, setLastLoadedPlanoId] = useState(null);
  const [importedMetas, setImportedMetas] = useState([]);
  const [showImportMetasModal, setShowImportMetasModal] = useState(false);
  const [importMetasError, setImportMetasError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    planoId: planoId,
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

  // Carregar planos ao inicializar o componente
  useEffect(() => {
    if (!planoId) {
    carregarPlanos();
    }
  }, [planoId]);

  // Carregar disciplinas quando o componente é montado
  useEffect(() => {
    if (planoId) {
      console.log('1. Iniciando carregamento de disciplinas do plano:', planoId);
      carregarDisciplinasDoPlanoDisciplinas(planoId);
    } else {
      console.warn('2. planoId não encontrado na URL');
    }
  }, [planoId]);

  // Efeito para verificar e buscar assuntos quando uma disciplina é selecionada
  useEffect(() => {
    // Criar um objeto para controlar os dropdowns de assunto
    const novoEstadoDropdown = {};
    formData.activities.forEach((activity, index) => {
      novoEstadoDropdown[index] = false;
    });
    setShowAssuntosDropdown(novoEstadoDropdown);

    // Verificar para cada atividade se precisamos buscar assuntos
    formData.activities.forEach((activity, index) => {
      if (activity.discipline && activity.discipline !== 'custom' && !assuntosDaDisciplina[activity.discipline]) {
        // Buscar assuntos para esta disciplina
        buscarAssuntosDaDisciplina(activity.discipline);
      }
    });
  }, [formData.activities]);

  // Carregamento de planos para o dropdown
  const carregarPlanos = async () => {
    try {
      setLoadingPlanos(true);
      const planosData = await planoService.listarPlanos();
      console.log('Planos carregados:', planosData);
      setPlanos(planosData);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      alert('Não foi possível carregar os planos de estudo. Verifique sua conexão.');
    } finally {
      setLoadingPlanos(false);
    }
  };

  // Carregamento de disciplinas do plano
  const carregarDisciplinasDoPlanoDisciplinas = async (planoIdParam) => {
    if (!planoIdParam) {
      console.warn('3. planoIdParam não fornecido');
      return;
    }
    try {
      console.log(`4. Iniciando busca do plano ${planoIdParam}...`);
      setLoadingDisciplinas(true);
      
      // Buscar o plano com suas disciplinas
      const plano = await planoService.buscarPlanoPorId(planoIdParam);
      console.log('5. Plano encontrado:', plano);
      
      if (plano && plano.disciplinas) {
        console.log('6. Disciplinas do plano:', plano.disciplinas);
        setDisciplinasDoPlanoDisciplinas(plano.disciplinas);
      } else {
        console.warn('7. Plano não encontrado ou sem disciplinas:', plano);
        setDisciplinasDoPlanoDisciplinas([]);
      }
    } catch (error) {
      console.error(`8. Erro ao carregar disciplinas do plano ${planoIdParam}:`, error);
      if (error.response) {
        console.error('9. Detalhes do erro:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      setDisciplinasDoPlanoDisciplinas([]);
    } finally {
      setLoadingDisciplinas(false);
    }
  };

  // Buscar assuntos de uma disciplina específica
  const buscarAssuntosDaDisciplina = (disciplinaNome) => {
    // Se já temos os assuntos em cache, não precisamos buscar novamente
    if (assuntosDaDisciplina[disciplinaNome]) {
      return;
    }

    // Procurar a disciplina nas disciplinas do plano
    const disciplina = disciplinasDoPlanoDisciplinas.find(d => d.nome === disciplinaNome);
    if (disciplina && disciplina.assuntos) {
      console.log(`Assuntos encontrados para a disciplina ${disciplinaNome}:`, disciplina.assuntos);
      // Armazenar os assuntos no cache
      setAssuntosDaDisciplina(prev => ({
        ...prev,
        [disciplinaNome]: disciplina.assuntos
      }));
    } else {
      console.log(`Nenhum assunto encontrado para a disciplina ${disciplinaNome}`);
      // Disciplina não encontrada ou sem assuntos
      setAssuntosDaDisciplina(prev => ({
        ...prev,
        [disciplinaNome]: []
      }));
    }
  };

  // Alternar visibilidade do dropdown de assuntos
  const toggleAssuntosDropdown = (index) => {
    setShowAssuntosDropdown(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Selecionar um assunto como título da meta
  const selecionarAssuntoComoTitulo = (index, assuntoNome) => {
    handleActivityChange(index, 'title', assuntoNome);
    toggleAssuntosDropdown(index);
  };

  useEffect(() => {
    if (id) {
      loadSprint();
    }
  }, [id]);

  const loadSprint = async () => {
    try {
      const sprint = await sprintService.buscarSprintPorId(id);
      console.log('Sprint carregada:', sprint);
      
      // Primeiro, definimos o planoId para que as disciplinas sejam carregadas
      const planoId = sprint.PlanoId;
      setLastLoadedPlanoId(planoId); // Importante: registrar qual plano foi carregado
      
      // Carregar as disciplinas do plano
      await carregarDisciplinasDoPlanoDisciplinas(planoId);
      
      // Depois, atualizamos os dados completos do formulário
      setFormData({
        title: sprint.nome,
        startDate: sprint.dataInicio,
        endDate: sprint.dataFim,
        planoId: planoId,
        activities: sprint.metas.map(meta => ({
          discipline: meta.disciplina,
          customDiscipline: '',
          title: meta.titulo,
          type: meta.tipo,
          relevance: meta.relevancia,
          comandos: meta.comandos || '',
          link: meta.link || ''
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
    
    if (!formData.planoId && !planoId) {
      alert('Selecione um plano de estudo para a sprint.');
      return;
    }
    
    try {
      const sprintData = {
        nome: formData.title,
        dataInicio: formData.startDate,
        dataFim: formData.endDate,
        planoId: planoId || formData.planoId,
        metas: formData.activities.map(activity => ({
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
      alert(error.message || (id ? 'Erro ao atualizar sprint. Tente novamente.' : 'Erro ao cadastrar sprint. Tente novamente.'));
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

    // Se a disciplina foi alterada, fechar o dropdown de assuntos
    if (field === 'discipline') {
      setShowAssuntosDropdown(prev => ({
        ...prev,
        [index]: false
      }));
      
      // E buscar assuntos para a nova disciplina se necessário
      if (value && value !== 'custom' && !assuntosDaDisciplina[value]) {
        buscarAssuntosDaDisciplina(value);
      }
    }
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
    
    // Adicionar o estado do dropdown para a nova atividade
    setShowAssuntosDropdown(prev => ({
      ...prev,
      [formData.activities.length]: false
    }));
  };

  const removeActivity = (index) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
    
    // Remover o estado do dropdown para a atividade removida
    const newShowAssuntosDropdown = { ...showAssuntosDropdown };
    delete newShowAssuntosDropdown[index];
    
    // Reorganizar os índices para os dropdowns restantes
    const updatedDropdownState = {};
    Object.keys(newShowAssuntosDropdown).forEach((key, i) => {
      const keyNum = Number(key);
      if (keyNum > index) {
        updatedDropdownState[keyNum - 1] = newShowAssuntosDropdown[keyNum];
      } else {
        updatedDropdownState[keyNum] = newShowAssuntosDropdown[keyNum];
      }
    });
    
    setShowAssuntosDropdown(updatedDropdownState);
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
    
    // Se estiver vazio, limpe o campo de comandos, caso contrário salve o conteúdo
    if (isEmpty) {
      handleActivityChange(currentActivityIndex, 'comandos', '');
    } else {
      handleActivityChange(currentActivityIndex, 'comandos', editorContent);
    }
    
    setShowTextEditor(false);
  };

  // Obtém as disciplinas disponíveis para seleção
  const getDisciplinasDisponiveis = () => {
    // Retorna apenas as disciplinas do plano, sem disciplinas predefinidas
      return disciplinasDoPlanoDisciplinas.map(d => d.nome);
  };
  
  // Verificar se uma disciplina tem assuntos disponíveis
  const temAssuntosDisponiveis = (disciplinaNome) => {
    return disciplinaNome && 
           disciplinaNome !== 'custom' && 
           assuntosDaDisciplina[disciplinaNome] && 
           assuntosDaDisciplina[disciplinaNome].length > 0;
  };

  // Depuração: mostrar estados atuais
  console.log('Estado atual:');
  console.log('- Plano ID:', formData.planoId);
  console.log('- Último plano carregado:', lastLoadedPlanoId);
  console.log('- Disciplinas carregadas:', disciplinasDoPlanoDisciplinas.map(d => d.nome));
  console.log('- Assuntos carregados para disciplinas:', Object.keys(assuntosDaDisciplina));

  // Função para importar metas via planilha
  const handleImportarMetasPlanilha = (file) => {
    setImportMetasError(null);
    setImportedMetas([]);
    setShowImportMetasModal(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const [header, ...rows] = json;

      // Esperado: disciplina, tipo, titulo, comandos, link, relevancia
      const colunasEsperadas = ['disciplina', 'tipo', 'titulo', 'comandos', 'link', 'relevancia'];
      const headerLower = header.map(h => (h || '').toString().toLowerCase().trim());
      const indices = colunasEsperadas.map(col => headerLower.indexOf(col));

      // Validação de header
      if (indices.some(idx => idx === -1)) {
        setImportMetasError({
          titulo: 'Erro na importação',
          mensagens: ['A planilha deve conter as colunas: disciplina, tipo, titulo, comandos, link, relevancia']
        });
        return;
      }

      // Validação de linhas
      const linhasComErro = rows.map((row, index) => {
        const disciplina = row[indices[0]];
        const tipo = row[indices[1]];
        const titulo = row[indices[2]];
        const relevancia = row[indices[5]];
        if (!disciplina || !tipo || !titulo || !relevancia) {
          return {
            linha: index + 2,
            motivo: [
              !disciplina ? 'Disciplina não preenchida' : '',
              !tipo ? 'Tipo não preenchido' : '',
              !titulo ? 'Título não preenchido' : '',
              !relevancia ? 'Relevância não preenchida' : ''
            ].filter(Boolean).join(', ')
          };
        }
        return null;
      }).filter(Boolean);

      if (linhasComErro.length > 0) {
        setImportMetasError({
          titulo: 'Erro na importação',
          mensagens: linhasComErro.map(erro => `Linha ${erro.linha}: ${erro.motivo}`)
        });
        return;
      }

      // Montar os dados importados
      const result = rows.map(row => ({
        disciplina: row[indices[0]]?.toString().trim() || '',
        tipo: row[indices[1]]?.toString().trim() || '',
        titulo: row[indices[2]]?.toString().trim() || '',
        comandos: row[indices[3]]?.toString().trim() || '',
        link: row[indices[4]]?.toString().trim() || '',
        relevancia: row[indices[5]]?.toString().trim() || ''
      }));
      setImportedMetas(result);
      setShowImportMetasModal(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveImportMeta = (index) => {
    const newData = [...importedMetas];
    newData.splice(index, 1);
    setImportedMetas(newData);
  };

  const handleCloseImportMetasModal = () => {
    setShowImportMetasModal(false);
    setImportedMetas([]);
    setImportMetasError(null);
  };

  if (loading || (planoId ? false : loadingPlanos)) {
    return <div className={styles.loading}>Carregando...</div>;
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
          <label htmlFor="title">Título da Sprint</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div className={styles.formGroup} style={{ flex: 1 }}>
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

          <div className={styles.formGroup} style={{ flex: 1 }}>
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
          <div className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Metas</h2>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              id="input-import-metas"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleImportarMetasPlanilha(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
            <button
              type="button"
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 20px',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                marginLeft: 8
              }}
              onClick={() => document.getElementById('input-import-metas').click()}
            >
              Importar
            </button>
          </div>
          {formData.activities.map((activity, index) => (
            <div key={index} className={styles.activityCard}>
              <div className={styles.activityHeader}>
                <h3>Meta {index + 1}</h3>
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
                      className={styles.selectField}
                    >
                      <option value="">Selecione uma disciplina</option>
                      {disciplinasDoPlanoDisciplinas.map((disciplina) => (
                        <option key={disciplina.id} value={disciplina.nome}>
                          {disciplina.nome}
                        </option>
                      ))}
                      <option value="custom">Outra (especifique)</option>
                    </select>
                    {activity.discipline === 'custom' && (
                      <input
                        type="text"
                        value={activity.customDiscipline}
                        onChange={(e) => handleActivityChange(index, 'customDiscipline', e.target.value)}
                        placeholder="Digite o nome da disciplina"
                        required
                        className={styles.inputField}
                      />
                    )}
                    {loadingDisciplinas ? (
                      <p className={styles.fieldHelp}>Carregando disciplinas...</p>
                    ) : disciplinasDoPlanoDisciplinas.length > 0 ? (
                      <p className={styles.fieldHelp}>
                        {disciplinasDoPlanoDisciplinas.length} disciplina(s) disponíveis
                      </p>
                    ) : (
                      <p className={styles.fieldHelp}>
                        Nenhuma disciplina encontrada para este plano
                      </p>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Título da Meta</label>
                    <div className={styles.inputWithDropdown}>
                      <input
                        type="text"
                        value={activity.title}
                        onChange={(e) => handleActivityChange(index, 'title', e.target.value)}
                        required
                      />
                      {temAssuntosDisponiveis(activity.discipline) && (
                        <button
                          type="button"
                          className={styles.assuntosButton}
                          onClick={() => toggleAssuntosDropdown(index)}
                          title="Selecionar um assunto como título"
                        >
                          <span>▼</span>
                        </button>
                      )}
                      {showAssuntosDropdown[index] && temAssuntosDisponiveis(activity.discipline) && (
                        <div className={styles.assuntosDropdown}>
                          <div className={styles.assuntosHeader}>
                            <span>Selecione um assunto:</span>
                            <button 
                              type="button" 
                              onClick={() => toggleAssuntosDropdown(index)}
                              className={styles.closeDropdownButton}
                            >
                              ×
                            </button>
                          </div>
                          <ul>
                            {assuntosDaDisciplina[activity.discipline].map((assunto, assuntoIndex) => (
                              <li 
                                key={assuntoIndex} 
                                onClick={() => selecionarAssuntoComoTitulo(index, assunto.nome)}
                              >
                                {assunto.nome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {temAssuntosDisponiveis(activity.discipline) && (
                      <p className={styles.fieldHelp}>
                        Clique na seta para selecionar um assunto como título
                      </p>
                    )}
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
            disabled={!formData.planoId}
          >
            + Adicionar Meta
          </button>
          {!formData.planoId && (
            <p className={styles.fieldHelp}>
              Selecione um plano de estudo para adicionar metas
            </p>
          )}
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

      {/* Modal de erro na importação de metas */}
      {importMetasError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(24,28,35,0.92)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#181c23',
            borderRadius: 16,
            padding: 24,
            minWidth: 500,
            maxWidth: 600,
            width: '90%',
            color: '#e0e6ed',
            boxShadow: '0 4px 32px #000a',
            position: 'relative',
          }}>
            <button
              onClick={handleCloseImportMetasModal}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: '#e0e6ed',
                fontSize: 24,
                cursor: 'pointer',
              }}
              title="Fechar"
            >
              ×
            </button>
            <h3 style={{ 
              color: '#ef4444', 
              marginBottom: 16,
              fontSize: 20,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {importMetasError.titulo}
            </h3>
            <div style={{ 
              background: 'rgba(239,68,68,0.1)', 
              borderRadius: 8, 
              padding: 16,
              maxHeight: '60vh',
              overflowY: 'auto',
              border: '1px solid rgba(239,68,68,0.2)'
            }}>
              {importMetasError.mensagens.map((msg, idx) => (
                <div key={idx} style={{ 
                  color: '#e0e6ed',
                  padding: '8px 0',
                  borderBottom: idx < importMetasError.mensagens.length - 1 ? '1px solid rgba(239,68,68,0.2)' : 'none'
                }}>
                  {msg}
                </div>
              ))}
            </div>
            <div style={{ 
              marginTop: 24,
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCloseImportMetasModal}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 24px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pré-visualização das metas importadas */}
      {showImportMetasModal && importedMetas.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(24,28,35,0.92)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#181c23',
            borderRadius: 16,
            padding: 24,
            minWidth: 900,
            maxWidth: 1200,
            width: '95%',
            color: '#e0e6ed',
            boxShadow: '0 4px 32px #000a',
            position: 'relative',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <button
              onClick={handleCloseImportMetasModal}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: '#e0e6ed',
                fontSize: 24,
                cursor: 'pointer',
              }}
              title="Fechar"
            >
              ×
            </button>
            <h3 style={{ color: '#e0e6ed', marginBottom: 16 }}>Pré-visualização da importação de metas</h3>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 16, color: '#e0e6ed', marginBottom: 8, background: 'rgba(37,99,235,0.18)', borderRadius: 8, position: 'sticky', top: 0, zIndex: 1, padding: 8, paddingRight: 16 }}>
                <div style={{ flex: 1, minWidth: 120, maxWidth: 180, marginLeft: 12, marginRight: 8, background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '6px 16px', textAlign: 'left' }}>
                  Disciplina
                </div>
                <div style={{ flex: 1, minWidth: 100, maxWidth: 140, marginRight: 8, background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '6px 16px', textAlign: 'left' }}>
                  Tipo
                </div>
                <div style={{ flex: 2, minWidth: 180, marginRight: 8, background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '6px 16px', textAlign: 'left' }}>
                  Título
                </div>
                <div style={{ flex: 2, minWidth: 180, marginRight: 8, background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '6px 16px', textAlign: 'left' }}>
                  Comandos
                </div>
                <div style={{ flex: 2, minWidth: 180, marginRight: 8, background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '6px 16px', textAlign: 'left' }}>
                  Link
                </div>
                <div style={{ flex: 1, minWidth: 110, maxWidth: 140, marginRight: 8, background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '6px 16px', textAlign: 'center' }}>
                  Relevância
                </div>
              </div>
              <div style={{ 
                maxHeight: '55vh', 
                overflowY: 'auto', 
                padding: 8, 
                border: '1px solid #fff', 
                borderRadius: 8, 
                boxSizing: 'border-box',
                scrollbarWidth: 'thin',
                scrollbarColor: '#666 transparent'
              }}>
                {importedMetas.map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: idx % 2 === 0 ? '#23283a' : '#181c23',
                      borderRadius: 8,
                      marginBottom: 8,
                      boxShadow: '0 1px 4px #0002',
                      minHeight: 44,
                    }}
                  >
                    <div style={{ minWidth: 120, maxWidth: 180, marginLeft: 12, marginRight: 8, color: '#e0e6ed', borderRadius: 8, fontWeight: 600, fontSize: 15, padding: '6px 16px', display: 'inline-block', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.disciplina}</div>
                    <div style={{ minWidth: 100, maxWidth: 140, marginRight: 8, color: '#e0e6ed', borderRadius: 8, fontWeight: 600, fontSize: 15, padding: '6px 16px', display: 'inline-block', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.tipo}</div>
                    <div style={{ flex: 2, minWidth: 180, color: '#e0e6ed', fontSize: 15, padding: '8px 0', marginLeft: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.titulo}</div>
                    <div style={{ flex: 2, minWidth: 180, color: '#e0e6ed', fontSize: 15, padding: '8px 0', marginLeft: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.comandos}</div>
                    <div style={{ flex: 2, minWidth: 180, color: '#e0e6ed', fontSize: 15, padding: '8px 0', marginLeft: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.link}</div>
                    <div style={{ minWidth: 110, maxWidth: 140, marginRight: 8, color: '#e0e6ed', borderRadius: 8, fontWeight: 600, fontSize: 18, padding: '6px 16px', display: 'inline-block', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <div className={styles.starsContainer} style={{ gap: 2, marginTop: 0 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`${styles.starButton} ${Number(row.relevancia) >= star ? styles.active : ''}`}
                              style={{ cursor: 'default', fontSize: 20, padding: 0, transition: 'none', color: Number(row.relevancia) >= star ? '#f59e0b' : '#4b5563' }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveImportMeta(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        marginRight: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remover item"
                    >
                      <img 
                        src={deleteMetasSprintIcon} 
                        alt="Remover" 
                        style={{ width: 20, height: 20 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ 
              marginTop: 24,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12
            }}>
              <button
                onClick={handleCloseImportMetasModal}
                style={{
                  background: 'none',
                  border: '1px solid #e0e6ed',
                  color: '#e0e6ed',
                  padding: '8px 24px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Cancelar
              </button>
              {/* Botão de salvar será implementado depois */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterSprint; 