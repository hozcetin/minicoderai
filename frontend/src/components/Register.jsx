import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // AuthContext'i import ediyoruz

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    age: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Context'ten login fonksiyonunu alıyoruz

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // DÜZELTME: Kayıt başarılı olduğunda da merkezi login fonksiyonunu kullanıyoruz.
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Kayıt sırasında bir hata oluştu.');
      }
    } catch (err) {
      setError('Sunucu bağlantısında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>MiniCoder AI - Kayıt Ol</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Ad Soyad:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>E-posta:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Şifre:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        {/* Yaş ve Cinsiyet alanları formda kalmaya devam ediyor */}
        <div style={{ marginBottom: '15px' }}>
          <label>Yaş:</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Cinsiyet:</label>
          <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
            <option value="">Seçiniz</option>
            <option value="male">Erkek</option>
            <option value="female">Kadın</option>
            <option value="other">Diğer</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Rol:</label>
          <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
            <option value="student">Öğrenci</option>
            <option value="teacher">Öğretmen</option>
          </select>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Zaten hesabın var mı? <a href="/login">Giriş Yap</a>
      </p>
    </div>
  );
}

export default Register;
