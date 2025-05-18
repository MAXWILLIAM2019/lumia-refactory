import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './VersoesDisciplina.module.css';
import { disciplinaService } from '../../services/disciplinaService';
import api from '../../services/api';
import backIcon from '../../assets/icons/menu.svg';
import compareIcon from '../../assets/icons/edit.svg';

export default function VersoesDisciplina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [disciplina, setDisciplina] = useState(null);
  const [versoes, setVersoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comparandoVersoes, setComparandoVersoes] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState({ v1: null, v2: null });
  const [comparacao, setComparacao] = useState(null);
  const [loadingComparacao, setLoadingComparacao] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');

      // Carrega os dados da disciplina
      const response = await api.get(`/disciplinas/${id}`);
      setDisciplina(response.data);

      // Carrega todas as versões desta disciplina
      const versoesData = await disciplinaService.listarVersoesDisciplina(id);
      setVersoes(versoesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Não foi possível carregar os dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltarClick = () => {
    navigate('/disciplinas');
  };

  const handleNovaVersaoClick = () => {
    navigate(`/disciplinas/${id}/nova-versao`);
  };

  const handleCompararClick = () => {
    setComparandoVersoes(!comparandoVersoes);
    setSelectedVersions({ v1: null, v2: null });
    setComparacao(null);
  };

  const handleSelecionarVersao = (versao, tipo) => {
    setSelectedVersions(prev => ({
      ...prev,
      [tipo]: prev[tipo] === versao.id ? null : versao.id
    }));
  };

  const efetuarComparacao = async () => {
    if (!selectedVersions.v1 || !selectedVersions.v2) {
      alert('Selecione duas versões para comparar.');
      return;
    }

    try {
      setLoadingComparacao(true);
      const resultado = await disciplinaService.compararVersoesDisciplina(
        selectedVersions.v1, 
        selectedVersions.v2
      );
      setComparacao(resultado);
    } catch (error) {
      console.error('Erro ao comparar versões:', error);
      alert('Não foi possível comparar as versões. Tente novamente.');
    } finally {
      setLoadingComparacao(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando dados da disciplina...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={carregarDados}>Tentar novamente</button>
          <button onClick={handleVoltarClick}>Voltar</button>
        </div>
      </div>
    );
  }

  if (!disciplina) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Disciplina não encontrada</p>
          <button onClick={handleVoltarClick}>Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleVoltarClick}>
          <img src={backIcon} alt="Voltar" />
          <span>Voltar</span>
        </button>
        <h1>Versões da Disciplina: {disciplina.nome}</h1>
      </div>

      <div className={styles.actions}>
        <button className={styles.newVersionButton} onClick={handleNovaVersaoClick}>
          + Nova Versão
        </button>
        <button 
          className={`${styles.compareButton} ${comparandoVersoes ? styles.active : ''}`}
          onClick={handleCompararClick}
        >
          <img src={compareIcon} alt="Comparar" />
          <span>{comparandoVersoes ? 'Cancelar Comparação' : 'Comparar Versões'}</span>
        </button>
      </div>

      {versoes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Esta disciplina não possui versões adicionais.</p>
          <button onClick={handleNovaVersaoClick}>Criar Primeira Versão</button>
        </div>
      ) : (
        <div className={styles.versoesList}>
          <h2>Versões Disponíveis</h2>
          
          {comparandoVersoes && (
            <div className={styles.comparisonPanel}>
              <p>Selecione duas versões para comparar:</p>
              <div className={styles.comparisonSelections}>
                <div className={styles.comparisonSelection}>
                  <span>Versão 1:</span>
                  <strong>{versoes.find(v => v.id === selectedVersions.v1)?.nome || 'Nenhuma'}</strong>
                </div>
                <div className={styles.comparisonSelection}>
                  <span>Versão 2:</span>
                  <strong>{versoes.find(v => v.id === selectedVersions.v2)?.nome || 'Nenhuma'}</strong>
                </div>
              </div>
              <button 
                className={styles.compareExecuteButton}
                onClick={efetuarComparacao}
                disabled={!selectedVersions.v1 || !selectedVersions.v2 || loadingComparacao}
              >
                {loadingComparacao ? 'Comparando...' : 'Comparar Selecionadas'}
              </button>
            </div>
          )}
          
          {versoes.map((versao) => (
            <div 
              key={versao.id} 
              className={`${styles.versaoCard} ${
                (selectedVersions.v1 === versao.id || selectedVersions.v2 === versao.id) ? 
                styles.selected : ''
              } ${!versao.ativa ? styles.inactive : ''}`}
              onClick={() => comparandoVersoes && handleSelecionarVersao(
                versao, 
                selectedVersions.v1 === versao.id ? 'v1' : 
                selectedVersions.v2 === versao.id ? 'v2' : 
                !selectedVersions.v1 ? 'v1' : 'v2'
              )}
            >
              <div className={styles.versaoInfo}>
                <div className={styles.versaoHeader}>
                  <h3>{versao.nome}</h3>
                  <span className={styles.versaoNumber}>v{versao.versao}</span>
                </div>
                
                {versao.descricao && (
                  <p className={styles.versaoDescription}>{versao.descricao}</p>
                )}
                
                <div className={styles.versaoMeta}>
                  <span className={versao.ativa ? styles.statusAtiva : styles.statusInativa}>
                    {versao.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                  <span className={styles.dataCriacao}>
                    Criada em: {new Date(versao.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className={styles.assuntosCount}>
                  {versao.assuntos?.length || 0} assuntos
                </div>
              </div>
              
              {comparandoVersoes && (
                <div className={styles.selectionIndicator}>
                  {selectedVersions.v1 === versao.id && <span>Versão 1</span>}
                  {selectedVersions.v2 === versao.id && <span>Versão 2</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {comparacao && (
        <div className={styles.comparisonResults}>
          <h2>Resultado da Comparação</h2>
          
          <div className={styles.comparisonHeader}>
            <div className={styles.comparisonVersion}>
              <h3>{versoes.find(v => v.id === selectedVersions.v1)?.nome || ''}</h3>
              <span>v{versoes.find(v => v.id === selectedVersions.v1)?.versao || ''}</span>
            </div>
            <div className={styles.comparisonArrow}>→</div>
            <div className={styles.comparisonVersion}>
              <h3>{versoes.find(v => v.id === selectedVersions.v2)?.nome || ''}</h3>
              <span>v{versoes.find(v => v.id === selectedVersions.v2)?.versao || ''}</span>
            </div>
          </div>
          
          <div className={styles.comparisonDetails}>
            {Object.keys(comparacao.campos).length > 0 ? (
              <div className={styles.camposChanges}>
                <h4>Alterações nos Campos</h4>
                <table className={styles.comparisonTable}>
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>Antes</th>
                      <th>Depois</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(comparacao.campos).map(([campo, valores]) => (
                      <tr key={campo}>
                        <td>{campo === 'nome' ? 'Nome' : 
                             campo === 'descricao' ? 'Descrição' : 
                             campo === 'ativa' ? 'Status' : campo}</td>
                        <td>{campo === 'ativa' ? (valores.antes ? 'Ativa' : 'Inativa') : valores.antes}</td>
                        <td>{campo === 'ativa' ? (valores.depois ? 'Ativa' : 'Inativa') : valores.depois}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Nenhuma alteração nos campos básicos.</p>
            )}
            
            <div className={styles.assuntosChanges}>
              <h4>Alterações nos Assuntos</h4>
              
              {comparacao.assuntos.adicionados.length > 0 && (
                <div className={styles.assuntosAdicionados}>
                  <h5>Assuntos Adicionados</h5>
                  <ul>
                    {comparacao.assuntos.adicionados.map((assunto, index) => (
                      <li key={index}>{assunto}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {comparacao.assuntos.removidos.length > 0 && (
                <div className={styles.assuntosRemovidos}>
                  <h5>Assuntos Removidos</h5>
                  <ul>
                    {comparacao.assuntos.removidos.map((assunto, index) => (
                      <li key={index}>{assunto}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {comparacao.assuntos.adicionados.length === 0 && 
               comparacao.assuntos.removidos.length === 0 && (
                <p>Nenhuma alteração nos assuntos.</p>
              )}
              
              {comparacao.assuntos.mantidos.length > 0 && (
                <div className={styles.assuntosMantidos}>
                  <h5>Assuntos Mantidos ({comparacao.assuntos.mantidos.length})</h5>
                  <button 
                    className={styles.toggleMantidosButton}
                    onClick={() => document.getElementById('assuntosMantidos').classList.toggle(styles.expanded)}
                  >
                    Mostrar/Ocultar
                  </button>
                  <ul id="assuntosMantidos" className={styles.assuntosMantidosList}>
                    {comparacao.assuntos.mantidos.map((assunto, index) => (
                      <li key={index}>{assunto}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 