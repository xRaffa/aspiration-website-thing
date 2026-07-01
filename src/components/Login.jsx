import React, { useState } from 'react'
import { API_BASE } from '../App'
import { User, BookOpen, Mail, Lock, LogIn, Sparkles } from 'lucide-react'

function Login({ setUser, showToast }) {
  const [role, setRole] = useState('user') // 'user' or 'admin'
  const [name, setName] = useState('')
  const [jurusan, setJurusan] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleChange = (e) => {
    setRole(e.target.value)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = { role }
    if (role === 'user') {
      if (!name.trim() || !jurusan) {
        setError('Nama dan Jurusan wajib diisi!')
        setLoading(false)
        return
      }
      payload.name = name.trim()
      payload.jurusan = jurusan
    } else {
      if (!email.trim() || !password) {
        setError('Email dan Password wajib diisi!')
        setLoading(false)
        return
      }
      payload.email = email.trim()
      payload.password = password
    }

    try {
      const response = await fetch(`${API_BASE}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal, silakan periksa kembali data Anda')
      }

      showToast(data.message || 'Login berhasil!', 'success')
      setUser(data.user)
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Sparkles size={32} />
          </div>
          <h2>Portal Aspirasi</h2>
          <p>Fakultas Teknik Komputer UNHAR</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Sliding capsule style role selector */}
          <div className="role-toggle-container">
            <input
              type="radio"
              id="role-user"
              name="role"
              value="user"
              checked={role === 'user'}
              onChange={handleRoleChange}
              className="role-radio"
            />
            <label htmlFor="role-user" className="role-label">
              <User size={16} /> Mahasiswa
            </label>

            <input
              type="radio"
              id="role-admin"
              name="role"
              value="admin"
              checked={role === 'admin'}
              onChange={handleRoleChange}
              className="role-radio"
            />
            <label htmlFor="role-admin" className="role-label">
              <Lock size={16} /> Admin
            </label>
          </div>

          {error && (
            <div className="form-error">
              <span>{error}</span>
            </div>
          )}

          {role === 'user' ? (
            /* Student Input Fields */
            <>
              <div className="form-group">
                <label htmlFor="student-name">Nama Lengkap</label>
                <div className="input-container">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="student-name"
                    placeholder="Masukkan nama lengkap Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="student-jurusan">Program Studi / Jurusan</label>
                <div className="input-container">
                  <BookOpen size={18} className="input-icon" />
                  <select
                    id="student-jurusan"
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Pilih Program Studi --</option>
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Sistem Informasi">Sistem Informasi</option>
                    <option value="Teknik Komputer">Teknik Komputer</option>
                    <option value="Teknologi Informasi">Teknologi Informasi</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            /* Admin Input Fields */
            <>
              <div className="form-group">
                <label htmlFor="admin-email">Surel / Email Admin</label>
                <div className="input-container">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="admin-email"
                    placeholder="admin@unhar.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="admin-password">Kata Sandi / Password</label>
                <div className="input-container">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="admin-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? (
              <svg className="spinner" viewBox="0 0 50 50">
                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
              </svg>
            ) : (
              <>
                <LogIn size={18} /> Masuk ke Portal
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
