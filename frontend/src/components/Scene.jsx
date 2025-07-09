// frontend/src/components/Scene.jsx

import React, { useState, useEffect } from 'react';

const styles = {
  scene: {
    width: '100%', height: '100%', backgroundColor: 'white',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    position: 'relative', gap: '30px', fontFamily: 'system-ui, sans-serif'
  },
  robot: { fontSize: '80px', transition: 'transform 0.3s ease' },
  robotActive: { transform: 'scale(1.1) rotate(10deg)' },
  button: { padding: '15px 30px', fontSize: '18px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc' },
  speechBubble: {
    position: 'absolute', bottom: '220px', backgroundColor: '#3498db', color: 'white',
    padding: '15px 25px', borderRadius: '20px', maxWidth: '80%', textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', opacity: 0,
    transform: 'translateY(20px) scale(0.9)',
    transition: 'opacity 0.3s ease, transform 0.3s ease', zIndex: 20
  },
  speechBubbleVisible: { opacity: 1, transform: 'translateY(0) scale(1)' }
};

function Scene({ action, onComplete, levelId }) {
  const [bubbleText, setBubbleText] = useState('');
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [isRobotActive, setIsRobotActive] = useState(false);

  useEffect(() => {
    if (!action) return;

    let text = '';
    if (action === 'say_hello') text = 'Merhaba! İlk kodun çalıştı!';
    if (action === 'move_forward') text = 'Harika, ilk adımı attım!';

    setBubbleText(text);
    setIsBubbleVisible(true);
    setIsRobotActive(true);
    
    const timer = setTimeout(() => {
      setIsBubbleVisible(false);
      setIsRobotActive(false);
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [action, onComplete]);

  return (
    <div style={styles.scene}>
      <div style={isBubbleVisible ? { ...styles.speechBubble, ...styles.speechBubbleVisible } : styles.speechBubble}>
        {bubbleText}
      </div>
      <div style={isRobotActive ? { ...styles.robot, ...styles.robotActive } : styles.robot}>
        🤖
      </div>
      <button style={styles.button}>Selamla</button>
    </div>
  );
}

export default Scene;