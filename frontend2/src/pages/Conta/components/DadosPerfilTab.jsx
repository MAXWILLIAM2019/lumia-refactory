import React from 'react';

const DadosPerfilTab = ({ 
  formData, 
  handleInputChange, 
  handleSave, 
  handleCancel, 
  saving, 
  message 
}) => {
  const formatarTelefone = (valor) => {
    // Remove todos os caracteres não numéricos
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Aplica a máscara baseada no número de dígitos
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 6) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    } else if (apenasNumeros.length <= 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
    } else {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
    }
  };

  const handleTelefoneChange = (e) => {
    const valorFormatado = formatarTelefone(e.target.value);
    handleInputChange({
      target: {
        name: 'telefone',
        value: valorFormatado
      }
    });
  };

  const opcoesFormacao = [
    { value: '', label: 'Selecione sua formação' },
    { value: 'ensino-fundamental', label: 'Ensino Fundamental' },
    { value: 'ensino-medio', label: 'Ensino Médio' },
    { value: 'ensino-superior-incompleto', label: 'Ensino Superior Incompleto' },
    { value: 'ensino-superior-completo', label: 'Ensino Superior Completo' },
    { value: 'pos-graduacao', label: 'Pós-graduação' },
    { value: 'mestrado', label: 'Mestrado' },
    { value: 'doutorado', label: 'Doutorado' }
  ];

  return (
    <div style={{ padding: '32px' }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{
          color: '#f9fafb',
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '24px'
        }}>
          Dados de Perfil
        </h2>

        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            backgroundColor: message.includes('sucesso') ? '#10b981' : '#ef4444',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

        <div style={{
          display: 'grid',
          gap: '24px'
        }}>
          {/* Nome - Read Only */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Nome Completo *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              readOnly
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#9ca3af',
                fontSize: '16px',
                cursor: 'not-allowed'
              }}
            />
            <p style={{
              color: '#6b7280',
              fontSize: '12px',
              marginTop: '4px'
            }}>
              Este campo não pode ser alterado
            </p>
          </div>

          {/* Email - Read Only */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#9ca3af',
                fontSize: '16px',
                cursor: 'not-allowed'
              }}
            />
            <p style={{
              color: '#6b7280',
              fontSize: '12px',
              marginTop: '4px'
            }}>
              Este campo não pode ser alterado
            </p>
          </div>

          {/* Telefone */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleTelefoneChange}
              placeholder="(11) 99999-9999"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#1f2937',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#f9fafb',
                fontSize: '16px'
              }}
            />
            <p style={{
              color: '#6b7280',
              fontSize: '12px',
              marginTop: '4px'
            }}>
              Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
            </p>
          </div>

          {/* Formação */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Formação
            </label>
            <select
              name="formacao"
              value={formData.formacao}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#1f2937',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#f9fafb',
                fontSize: '16px'
              }}
            >
              {opcoesFormacao.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          {/* Biografia */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Biografia
            </label>
            <textarea
              name="biografia"
              value={formData.biografia}
              onChange={handleInputChange}
              placeholder="Conte um pouco sobre você..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#1f2937',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#f9fafb',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Trabalhando Atualmente */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#d1d5db',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                name="isTrabalhando"
                checked={formData.isTrabalhando}
                onChange={handleInputChange}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#3b82f6'
                }}
              />
              Estou trabalhando atualmente
            </label>
          </div>

          {/* Aceita Termos */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#d1d5db',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                name="isAceitaTermos"
                checked={formData.isAceitaTermos}
                onChange={handleInputChange}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#3b82f6'
                }}
              />
              Concordo com os Termos de Uso da plataforma
            </label>
          </div>
        </div>

        {/* Botões */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '32px',
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
              color: '#9ca3af',
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
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1
            }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DadosPerfilTab;
