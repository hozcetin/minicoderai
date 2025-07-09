import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Sayfa ilk yüklendiğinde kontrol için

  useEffect(() => {
    // Sayfa ilk yüklendiğinde localStorage'ı kontrol et
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Kullanıcı verisi okunurken hata:", error);
        localStorage.clear(); // Hatalı veriyi temizle
      }
    }
    setLoading(false); // Kontrol bitti, yükleme tamamlandı
  }, []);

  const login = (userData, userToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setCurrentUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setToken(null);
  };

  const value = {
    currentUser,
    token,
    loading,
    login,
    logout
  };

  // Yükleme tamamlanana kadar hiçbir şey gösterme
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
