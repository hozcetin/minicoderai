// frontend/src/components/InfoModal.jsx

import React from 'react';
import ScoreDisplay from './ScoreDisplay';

function InfoModal({ title, message, score, badges, onClose, onNextLevel }) {
  const handleBackdropClick = (e) => {
    if (e.target.id === 'modal-backdrop') {
      onClose();
    }
  };

  return (
    <div id="modal-backdrop" className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        
        {score > 0 && <ScoreDisplay score={score} badges={badges} />}
        
        <div className="modal-actions">
          <button className="modal-button retry" onClick={onClose}>Tekrar Dene</button>
          {score > 0 && <button className="modal-button next" onClick={onNextLevel}>Sonraki Seviye</button>}
        </div>
      </div>
    </div>
  );
}

export default InfoModal;