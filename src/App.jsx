import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import UserDashboard from './components/UserDashboard'
import AdminDashboard from './components/AdminDashboard'
import { GraduationCap, LogOut, MessageSquare, ShieldAlert } from 'lucide-react'

// Dynamic API Base calculation to seamlessly work in both Vite dev mode (via proxy)
// and production XAMPP subfolders (e.g. http://localhost/pkl-stuffs/dist/)
export const API_BASE = import.meta.env.DEV
  ? '/api'
  : (window.location.pathname.includes('/dist') ? '../api' : './api');

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('unhar_surat_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('unhar_surat_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('unhar_surat_user');
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Berhasil keluar dari sistem', 'success');
  };

  return (
    <div className="app-container">
      {user && (
        <header className="app-header">
          <div className="header-brand">
            <div className="brand-logo">
              <GraduationCap size={22} />
            </div>
            <div className="brand-text">
              <h1>FTKOM UNHAR</h1>
              <p>Portal Aspirasi Mahasiswa</p>
            </div>
          </div>
          <div className="header-user">
            {user.role === 'admin' ? (
              <span className="user-badge admin-badge">
                <ShieldAlert size={16} /> Admin Panel ({user.email})
              </span>
            ) : (
              <span className="user-badge">
                <MessageSquare size={16} /> {user.name} ({user.jurusan})
              </span>
            )}
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </header>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!user ? (
          <Login setUser={setUser} showToast={showToast} />
        ) : user.role === 'admin' ? (
          <AdminDashboard user={user} showToast={showToast} />
        ) : (
          <UserDashboard user={user} showToast={showToast} />
        )}
      </main>

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default App
