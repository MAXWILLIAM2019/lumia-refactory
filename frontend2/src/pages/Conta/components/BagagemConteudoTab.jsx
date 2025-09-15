import React, { useState } from 'react';

const BagagemConteudoTab = () => {
  const [bagagemData, setBagagemData] = useState({
    areaEstudo: '',
    preparacao: '',
    disponibilidade: '',
    trajetoria: '',
    conhecimentos: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const areasEstudo = [
    { value: 'programacao', label: 'Programação' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'gestao', label: 'Gestão' },
    { value: 'financas', label: 'Finanças' },
    { value: 'rh', label: 'Recursos Humanos' },
    { value: 'outro', label: 'Outro' }
  ];

  const preparacoes = [
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' },
    { value: 'especialista', label: 'Especialista' }
  ];

  const disponibilidades = [
    { value: 'manha', label: 'Manhã (6h às 12h)' },
    { value: 'tarde', label: 'Tarde (12h às 18h)' },
    { value: 'noite', label: 'Noite (18h às 24h)' },
    { value: 'madrugada', label: 'Madrugada (0h às 6h)' },
    { value: 'flexivel', label: 'Flexível' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBagagemData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // TODO: Implementar chamada para API de bagagem de conteúdo
      console.log('Salvando bagagem de conteúdo...', bagagemData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Dados salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      setMessage('Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setBagagemData({
      areaEstudo: '',
      preparacao: '',
      disponibilidade: '',
      trajetoria: '',
      conhecimentos: ''
    });
    setMessage('');
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ 
        color: '#f9fafb', 
        fontSize: '24px', 
        fontWeight: '600', 
        marginBottom: '24px',
        borderBottom: '2px solid #374151',
        paddingBottom: '12px'
      }}>
        Bagagem de conteúdo
      </h2>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ 
          display: 'block', 
          color: '#d1d5db', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px' 
        }}>
          Área de Estudo
        </label>
        <select
          name="areaEstudo"
          value={bagagemData.areaEstudo}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '16px'
          }}
        >
          <option value="">Selecione uma área</option>
          {areasEstudo.map(area => (
            <option key={area.value} value={area.value}>
              {area.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ 
          display: 'block', 
          color: '#d1d5db', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px' 
        }}>
          Preparação
        </label>
        <select
          name="preparacao"
          value={bagagemData.preparacao}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '16px'
          }}
        >
          <option value="">Selecione seu nível</option>
          {preparacoes.map(prep => (
            <option key={prep.value} value={prep.value}>
              {prep.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ 
          display: 'block', 
          color: '#d1d5db', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px' 
        }}>
          Disponibilidade
        </label>
        <select
          name="disponibilidade"
          value={bagagemData.disponibilidade}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '16px'
          }}
        >
          <option value="">Selecione sua disponibilidade</option>
          {disponibilidades.map(disp => (
            <option key={disp.value} value={disp.value}>
              {disp.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ 
          display: 'block', 
          color: '#d1d5db', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px' 
        }}>
          Trajetória
        </label>
        <textarea
          name="trajetoria"
          value={bagagemData.trajetoria}
          onChange={handleInputChange}
          placeholder="Conte sobre sua trajetória profissional..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '16px',
            resize: 'vertical',
            minHeight: '100px'
          }}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={{ 
          display: 'block', 
          color: '#d1d5db', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px' 
        }}>
          Conhecimentos
        </label>
        <textarea
          name="conhecimentos"
          value={bagagemData.conhecimentos}
          onChange={handleInputChange}
          placeholder="Descreva seus conhecimentos e habilidades..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '16px',
            resize: 'vertical',
            minHeight: '100px'
          }}
        />
      </div>

      {message && (
        <div style={{ 
          marginBottom: '24px',
          padding: '12px 16px',
          backgroundColor: message.includes('sucesso') ? '#065f46' : '#7f1d1d',
          border: `1px solid ${message.includes('sucesso') ? '#10b981' : '#ef4444'}`,
          borderRadius: '8px',
          color: '#f9fafb',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        justifyContent: 'flex-end' 
      }}>
        <button
          onClick={handleCancel}
          disabled={saving}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#d1d5db',
            fontSize: '16px',
            fontWeight: '500',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.5 : 1
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px',
            backgroundColor: saving ? '#6b7280' : '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '500',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
};

export default BagagemConteudoTab;

