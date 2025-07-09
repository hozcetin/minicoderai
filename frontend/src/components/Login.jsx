import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // AuthContext'i import ediyoruz

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // DÜZELTME: Artık localStorage'a elle yazmıyoruz.
        // Merkezi login fonksiyonumuz hem state'i hem de localStorage'ı güncelliyor.
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Giriş sırasında bir hata oluştu.');
      }
    } catch (err) {
      setError('Sunucu bağlantısında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>MiniCoder AI - Giriş Yap</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>E-posta:</label>
          <input
            type="email" name="email" value={formData.email}
            onChange={handleChange} required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Şifre:</label>
          <input
            type="password" name="password" value={formData.password}
            onChange={handleChange} required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Hesabın yok mu? <a href="/register">Kayıt Ol</a>
      </p>
    </div>
  );
}

export default Login;
