// frontend/src/components/InfoModal.jsx

import React from 'react';
import ScoreDisplay from './ScoreDisplay';

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '30px', borderRadius: '10px', minWidth: '350px', maxWidth: '500px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', textAlign: 'center', position: 'relative' },
    title: { marginTop: 0, fontSize: '24px' },
    message: { marginBottom: '20px', fontSize: '16px', color: '#333' },
    buttonContainer: { display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' },
    button: { padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '16px' },
    closeButton: { position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' },
};

function InfoModal({ title, message, score, badges, onClose, onNextLevel, isSuccess, isInfo }) {

    if (isInfo) {
        // Bu, sadece bilgi amaçlı, kısa süreli bir modal.
        return (
            <div style={styles.overlay} onClick={onClose}>
                <div style={styles.modal} onClick={e => e.stopPropagation()}>
                    <button style={styles.closeButton} onClick={onClose}>&times;</button>
                    <h2 style={styles.title}>{title}</h2>
                    <p style={styles.message}>{message}</p>
                </div>
            </div>
        );
    }
    
    // Bu, seviye sonu başarı/başarısızlık modalı.
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                 <button style={styles.closeButton} onClick={onClose}>&times;</button>
                <h2 style={styles.title}>{title}</h2>
                <p style={styles.message}>{message}</p>
                {isSuccess && <ScoreDisplay score={score} badges={badges} />}
                <div style={styles.buttonContainer}>
                    <button style={{ ...styles.button, backgroundColor: '#ccc' }} onClick={onClose}>
                        Tekrar Dene
                    </button>
                    {isSuccess && (
                        <button style={{ ...styles.button, backgroundColor: '#28a745', color: 'white' }} onClick={onNextLevel}>
                            Sonraki Seviye
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InfoModal;