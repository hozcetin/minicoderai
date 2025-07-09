import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const headerStyles = {
  container: { height: '60px', backgroundColor: '#ffffff', borderBottom: '1px solid #dfe1e5', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', fontFamily: 'system-ui, sans-serif' },
  logo: { fontWeight: 'bold', color: '#172b4d', flexShrink: 0 },
  userArea: { display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 },
  button: { padding: '8px 12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '500' }
};

const levelBarStyles = {
  container: { display: 'flex', alignItems: 'center', gap: '5px', flexGrow: 1, justifyContent: 'center', padding: '0 20px' },
  button: { width: '40px', height: '40px', backgroundColor: '#ecf0f1', border: '2px solid #bdc3c7', borderRadius: '50%', cursor: 'pointer', color: '#7f8c8d', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', flexShrink: 0 },
  completed: { backgroundColor: '#2ecc71', color: 'white', border: '2px solid #27ae60' },
  current: { border: '3px solid #3498db', transform: 'scale(1.1)' }
};

function Header({ levels, currentLevelId, completedLevels, onLevelSelect }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={headerStyles.container}>
      <div style={headerStyles.logo}>MiniCoderAI</div>
      
      {/* İlerleme çubuğu sadece props olarak gelirse gösterilir */}
      {levels && onLevelSelect && (
        <div style={levelBarStyles.container}>
          {levels.slice(0, 10).map(level => {
            const isCompleted = completedLevels && completedLevels[level.id];
            const isCurrent = level.id === currentLevelId;
            let style = { ...levelBarStyles.button };
            if (isCompleted) style = { ...style, ...levelBarStyles.completed };
            if (isCurrent) style = { ...style, ...levelBarStyles.current };
            return (
              <button key={level.id} style={style} onClick={() => onLevelSelect(level.id)} title={`Seviye ${level.id}: ${level.name}`}>
                {level.id}
              </button>
            );
          })}
        </div>
      )}
      
      <div style={headerStyles.userArea}>
        {currentUser ? (
          <>
            <span style={{ fontWeight: '500' }}>Merhaba, {currentUser.name}!</span>
            <button onClick={handleLogout} style={{...headerStyles.button, backgroundColor: '#e74c3c', color: 'white'}}>Çıkış Yap</button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} style={{...headerStyles.button, backgroundColor: '#3498db', color: 'white'}}>Giriş Yap</button>
        )}
      </div>
    </div>
  );
}

export default Header;
