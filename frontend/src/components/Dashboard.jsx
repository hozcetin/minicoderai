import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return <div>Yükleniyor...</div>;
  }

  // Rol ve Cinsiyet için çeviri fonksiyonları
  const getRoleInTurkish = (role) => {
    if (role === 'student') return 'Öğrenci';
    if (role === 'teacher') return 'Öğretmen';
    return role;
  };

  const getGenderInTurkish = (gender) => {
    if (gender === 'male') return 'Erkek';
    if (gender === 'female') return 'Kadın';
    if (gender === 'other') return 'Diğer';
    return gender;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>MiniCoder AI - Hoş Geldin, {currentUser.name}!</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Çıkış Yap
        </button>
      </div>
      <div style={{ background: '#ffffff', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3>Kullanıcı Bilgileri</h3>
        <p><strong>Ad Soyad:</strong> {currentUser.name}</p>
        <p><strong>E-posta:</strong> {currentUser.email}</p>
        <p><strong>Rol:</strong> {getRoleInTurkish(currentUser.role)}</p>
        {currentUser.age && <p><strong>Yaş:</strong> {currentUser.age}</p>}
        {currentUser.gender && <p><strong>Cinsiyet:</strong> {getGenderInTurkish(currentUser.gender)}</p>}
      </div>
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
        <h3>🚀 Kodlama Alanına Hazır!</h3>
        <p>Blok tabanlı kodlama alanı ve yapay zeka desteği ile öğrenmeye başla.</p>
        <button
          style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}
          onClick={() => navigate('/coding')}
        >
          Kodlama Alanını Aç
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
