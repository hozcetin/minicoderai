// frontend/src/components/ScoreDisplay.jsx

import React from 'react';

const styles = {
  container: {
    margin: '20px 0 10px 0',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #eee',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    color: '#555',
    fontWeight: '600',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
  },
  score: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#27ae60',
  },
  badge: {
    fontSize: '40px',
  }
};

function ScoreDisplay({ score, badges }) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Kazandıkların</h3>
      <div style={styles.content}>
        <div>
          <div style={styles.score}>+{score} Puan</div>
        </div>
        {badges && badges.length > 0 && (
          <div>
            {badges.map((badge, index) => (
              <span key={index} style={styles.badge} title={badge.name}>
                {badge.icon}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoreDisplay;