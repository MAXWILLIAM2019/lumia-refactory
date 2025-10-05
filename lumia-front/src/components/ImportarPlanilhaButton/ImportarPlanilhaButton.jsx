import React, { useRef } from 'react';
import './ImportarPlanilhaButton.css';

export default function ImportarPlanilhaButton({ onFileSelected }) {
  const fileInputRef = useRef();

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileSelected) {
      onFileSelected(file);
    }
  };

  return (
    <>
      <button className="importar-planilha-btn" type="button" onClick={handleButtonClick}>
        {/* Ícone de upload opcional */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight: 8}}>
          <path d="M12 16V4M12 16l-4-4M12 16l4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="4" y="18" width="16" height="2" rx="1" fill="#fff"/>
        </svg>
        Importar
      </button>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  );
} 