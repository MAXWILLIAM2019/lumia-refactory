import { useState, useEffect } from 'react';
import { testEndpoint, testAllEndpoints } from '../../utils/api-tester';
import { FEATURE_FLAGS, getFeatureFlag, setFeatureFlag } from '../../config/feature-flags';
import styles from './TestEndpoints.module.css';

/**
 * Página para testar os endpoints da API
 * 
 * Esta página permite testar os endpoints antigos e novos da API,
 * comparando as respostas e verificando se estão funcionando corretamente.
 * É útil para validar a migração dos endpoints.
 */
export default function TestEndpoints() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState('PLANOS');
  const [selectedEndpoint, setSelectedEndpoint] = useState('BASE');
  const [params, setParams] = useState([]);
  const [method, setMethod] = useState('get');
  const [requestBody, setRequestBody] = useState('');
  const [error, setError] = useState('');
  
  // Opções de módulos e endpoints
  const moduleOptions = [
    { value: 'PLANOS', label: 'Planos' },
    { value: 'DISCIPLINAS', label: 'Disciplinas' },
    { value: 'SPRINTS', label: 'Sprints' },
    { value: 'ALUNOS', label: 'Alunos' },
    { value: 'AUTH', label: 'Autenticação' }
  ];
  
  const endpointOptions = {
    PLANOS: [
      { value: 'BASE', label: 'Listar Planos', params: [] },
      { value: 'DETAIL', label: 'Buscar Plano por ID', params: ['id'] },
      { value: 'DISCIPLINAS', label: 'Listar Disciplinas do Plano', params: ['id'] }
    ],
    DISCIPLINAS: [
      { value: 'BASE', label: 'Listar Disciplinas', params: [] },
      { value: 'ATIVAS', label: 'Listar Disciplinas Ativas', params: [] },
      { value: 'DETAIL', label: 'Buscar Disciplina por ID', params: ['id'] },
      { value: 'VERSOES', label: 'Listar Versões da Disciplina', params: ['id'] },
      { value: 'COMPARAR', label: 'Comparar Versões', params: ['id1', 'id2'] }
    ],
    SPRINTS: [
      { value: 'BASE', label: 'Listar Sprints', params: [] },
      { value: 'DETAIL', label: 'Buscar Sprint por ID', params: ['id'] },
      { value: 'POR_PLANO', label: 'Listar Sprints do Plano', params: ['planoId'] },
      { value: 'METAS', label: 'Listar Metas da Sprint', params: ['id'] }
    ],
    ALUNOS: [
      { value: 'BASE', label: 'Listar Alunos', params: [] },
      { value: 'DETAIL', label: 'Buscar Aluno por ID', params: ['id'] },
      { value: 'SPRINTS', label: 'Listar Sprints do Aluno', params: [] }
    ],
    AUTH: [
      { value: 'ME', label: 'Dados do Usuário Autenticado', params: [] },
      { value: 'IMPERSONATE', label: 'Impersonar Usuário', params: ['id'] }
    ]
  };
  
  // Atualiza os parâmetros quando o endpoint muda
  useEffect(() => {
    const selectedEndpointInfo = endpointOptions[selectedModule]?.find(e => e.value === selectedEndpoint);
    if (selectedEndpointInfo) {
      setParams(selectedEndpointInfo.params.map(param => ''));
    } else {
      setParams([]);
    }
  }, [selectedModule, selectedEndpoint]);
  
  // Executa um teste individual
  const handleTestEndpoint = async () => {
    setLoading(true);
    setError('');
    
    try {
      let data = null;
      if (['post', 'put'].includes(method.toLowerCase()) && requestBody) {
        try {
          data = JSON.parse(requestBody);
        } catch (e) {
          setError('Erro ao parsear o corpo da requisição: ' + e.message);
          setLoading(false);
          return;
        }
      }
      
      const result = await testEndpoint(selectedModule, selectedEndpoint, params, method, data);
      setTestResults({ [selectedModule]: { [selectedEndpoint]: result } });
    } catch (error) {
      setError('Erro ao testar endpoint: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Executa testes em todos os endpoints principais
  const handleTestAllEndpoints = async () => {
    setLoading(true);
    setError('');
    
    try {
      const results = await testAllEndpoints();
      setTestResults(results);
    } catch (error) {
      setError('Erro ao testar todos os endpoints: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Atualiza um parâmetro
  const handleParamChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = value;
    setParams(newParams);
  };
  
  // Ativa ou desativa o uso dos novos endpoints
  const toggleNewEndpoints = () => {
    const currentValue = getFeatureFlag(FEATURE_FLAGS.USE_NEW_ENDPOINTS);
    setFeatureFlag(FEATURE_FLAGS.USE_NEW_ENDPOINTS, !currentValue);
  };
  
  return (
    <div className={styles.container}>
      <h1>Teste de Endpoints</h1>
      
      <div className={styles.featureFlagToggle}>
        <label>
          <input
            type="checkbox"
            checked={getFeatureFlag(FEATURE_FLAGS.USE_NEW_ENDPOINTS)}
            onChange={toggleNewEndpoints}
          />
          Usar novos endpoints
        </label>
      </div>
      
      <div className={styles.testForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Módulo:</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              disabled={loading}
            >
              {moduleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Endpoint:</label>
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              disabled={loading}
            >
              {endpointOptions[selectedModule]?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Método:</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              disabled={loading}
            >
              <option value="get">GET</option>
              <option value="post">POST</option>
              <option value="put">PUT</option>
              <option value="delete">DELETE</option>
            </select>
          </div>
        </div>
        
        {params.length > 0 && (
          <div className={styles.paramsContainer}>
            <h3>Parâmetros:</h3>
            {params.map((param, index) => {
              const paramName = endpointOptions[selectedModule]
                ?.find(e => e.value === selectedEndpoint)
                ?.params[index];
                
              return (
                <div key={index} className={styles.formGroup}>
                  <label>{paramName}:</label>
                  <input
                    type="text"
                    value={param}
                    onChange={(e) => handleParamChange(index, e.target.value)}
                    disabled={loading}
                    placeholder={`Valor para ${paramName}`}
                  />
                </div>
              );
            })}
          </div>
        )}
        
        {['post', 'put'].includes(method.toLowerCase()) && (
          <div className={styles.bodyContainer}>
            <h3>Corpo da Requisição:</h3>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              disabled={loading}
              placeholder="Insira o corpo da requisição em formato JSON"
              rows={5}
            />
          </div>
        )}
        
        <div className={styles.buttonContainer}>
          <button
            onClick={handleTestEndpoint}
            disabled={loading}
            className={styles.testButton}
          >
            {loading ? 'Testando...' : 'Testar Endpoint'}
          </button>
          
          <button
            onClick={handleTestAllEndpoints}
            disabled={loading}
            className={styles.testAllButton}
          >
            {loading ? 'Testando...' : 'Testar Todos os Endpoints'}
          </button>
        </div>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </div>
      
      {Object.keys(testResults).length > 0 && (
        <div className={styles.resultsContainer}>
          <h2>Resultados dos Testes</h2>
          
          {Object.entries(testResults).map(([module, moduleResults]) => (
            <div key={module} className={styles.moduleResults}>
              <h3>{module}</h3>
              
              {Object.entries(moduleResults).map(([endpoint, result]) => (
                <div key={endpoint} className={styles.endpointResult}>
                  <h4>{endpoint}</h4>
                  
                  <div className={styles.resultComparison}>
                    <div className={styles.resultColumn}>
                      <h5>Endpoint Antigo</h5>
                      <div className={`${styles.statusBadge} ${result.old.success ? styles.success : styles.error}`}>
                        {result.old.success ? 'Sucesso' : 'Erro'}
                      </div>
                      {result.old.success ? (
                        <div className={styles.resultData}>
                          <p>Status: {result.old.status}</p>
                          <p>Tempo: {result.old.time.toFixed(2)}ms</p>
                          <pre>{JSON.stringify(result.old.data, null, 2)}</pre>
                        </div>
                      ) : (
                        <div className={styles.resultError}>
                          <p>Erro: {result.old.error?.message}</p>
                          <p>Status: {result.old.error?.status}</p>
                          {result.old.error?.data && (
                            <pre>{JSON.stringify(result.old.error.data, null, 2)}</pre>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.resultColumn}>
                      <h5>Endpoint Novo</h5>
                      <div className={`${styles.statusBadge} ${result.new.success ? styles.success : styles.error}`}>
                        {result.new.success ? 'Sucesso' : 'Erro'}
                      </div>
                      {result.new.success ? (
                        <div className={styles.resultData}>
                          <p>Status: {result.new.status}</p>
                          <p>Tempo: {result.new.time.toFixed(2)}ms</p>
                          <pre>{JSON.stringify(result.new.data, null, 2)}</pre>
                        </div>
                      ) : (
                        <div className={styles.resultError}>
                          <p>Erro: {result.new.error?.message}</p>
                          <p>Status: {result.new.error?.status}</p>
                          {result.new.error?.data && (
                            <pre>{JSON.stringify(result.new.error.data, null, 2)}</pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.comparisonSummary}>
                    <h5>Comparação</h5>
                    <ul>
                      {result.comparison.bothSucceeded && (
                        <li className={styles.success}>Ambos os endpoints funcionaram corretamente</li>
                      )}
                      {result.comparison.bothFailed && (
                        <li className={styles.error}>Ambos os endpoints falharam</li>
                      )}
                      {result.comparison.onlyOldSucceeded && (
                        <li className={styles.warning}>Apenas o endpoint antigo funcionou</li>
                      )}
                      {result.comparison.onlyNewSucceeded && (
                        <li className={styles.warning}>Apenas o endpoint novo funcionou</li>
                      )}
                      {result.comparison.bothSucceeded && (
                        <>
                          <li className={result.comparison.sameStatusCode ? styles.success : styles.warning}>
                            Status code: {result.comparison.sameStatusCode ? 'Igual' : 'Diferente'}
                          </li>
                          <li className={result.comparison.sameDataStructure ? styles.success : styles.warning}>
                            Estrutura de dados: {result.comparison.sameDataStructure ? 'Compatível' : 'Diferente'}
                          </li>
                        </>
                      )}
                    </ul>
                    
                    {result.comparison.differences && result.comparison.differences.length > 0 && (
                      <div className={styles.differences}>
                        <h6>Diferenças encontradas:</h6>
                        <ul>
                          {result.comparison.differences.map((diff, index) => (
                            <li key={index}>
                              {diff.path && <span>Campo: {diff.path}</span>}
                              {diff.oldType && diff.newType && (
                                <span>Tipo: {diff.oldType} → {diff.newType}</span>
                              )}
                              {diff.oldOnly && (
                                <span>Campos apenas no endpoint antigo: {diff.oldOnly.join(', ')}</span>
                              )}
                              {diff.newOnly && (
                                <span>Campos apenas no endpoint novo: {diff.newOnly.join(', ')}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
