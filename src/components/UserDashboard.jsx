import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { MessageSquarePlus, History, Send, MessageCircle, RefreshCw } from 'lucide-react'

function UserDashboard({ user, showToast }) {
  const [category, setCategory] = useState('Aspirasi')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const categories = ['Aspirasi', 'Saran', 'Kritik', 'Pesan & Kesan']

  const fetchHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('aspirations')
        .select('*')
        .eq('name', user.name)
        .eq('jurusan', user.jurusan)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }
      setHistory(data || [])
    } catch (err) {
      console.error(err)
      showToast('Gagal memuat riwayat aspirasi', 'error')
    } finally {
      if (!isSilent) setLoadingHistory(false)
    }
  }, [user.name, user.jurusan, showToast])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      showToast('Pesan aspirasi tidak boleh kosong!', 'error')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('aspirations')
        .insert([
          {
            name: user.name,
            jurusan: user.jurusan,
            category,
            message: message.trim(),
            status: 'pending'
          }
        ])

      if (error) {
        throw error
      }

      showToast('Aspirasi berhasil terkirim!', 'success')
      setMessage('')
      fetchHistory(true) // Refresh history feed silently
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  return (
    <div className="dashboard-container">
      <div className="user-grid">
        {/* Left Column: Submit Aspiration Form */}
        <div className="dashboard-card">
          <h2 className="card-title">
            <MessageSquarePlus size={22} className="text-primary" style={{ color: 'var(--primary)' }} />
            Kirim Surat Aspirasi
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ paddingLeft: 0 }}>
              <label style={{ marginBottom: '0.5rem', display: 'block' }}>Kategori Masukan</label>
              <div className="category-selector">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-pill ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ paddingLeft: 0 }}>
              <label htmlFor="aspiration-message" style={{ marginBottom: '0.5rem', display: 'block' }}>Isi Aspirasi / Pesan & Kesan</label>
              <div className="input-container" style={{ display: 'flex', flexDirection: 'column' }}>
                <textarea
                  id="aspiration-message"
                  placeholder="Tuliskan aspirasi, kritik, saran, atau pesan & kesan Anda secara sopan..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value.substring(0, 500))}
                  maxLength={500}
                  rows={6}
                  style={{ padding: '0.75rem 1rem', width: '100%', minHeight: '150px', resize: 'vertical' }}
                  required
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '0.25rem' }}>
                  <span className="char-counter">{message.length}/500 karakter</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                </svg>
              ) : (
                <>
                  <Send size={16} /> Kirim Aspirasi
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: History Feed Card */}
        <div className="dashboard-card">
          <div className="feed-header">
            <h3 className="card-title" style={{ margin: 0 }}>
              <History size={22} className="text-primary" style={{ color: 'var(--primary)' }} />
              Riwayat Aspirasi Anda
            </h3>
            <button 
              type="button"
              onClick={() => fetchHistory()} 
              className="btn-secondary btn-small"
              title="Refresh"
              disabled={loadingHistory}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem' }}
            >
              <RefreshCw size={14} className={loadingHistory ? "spinner" : ""} />
              Aktualkan
            </button>
          </div>

          {loadingHistory && history.length === 0 ? (
            <div className="empty-state">
              <svg className="spinner" viewBox="0 0 50 50">
                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
              </svg>
              <p>Memuat riwayat...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <MessageCircle size={48} style={{ color: '#cbd5e1' }} />
              <p style={{ marginTop: '0.5rem' }}>Belum ada aspirasi yang Anda kirimkan.</p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kirim pesan pertamamu lewat form di sebelah kiri.</span>
            </div>
          ) : (
            <div className="feed-list">
              {history.map((item) => (
                <div key={item.id} className="aspiration-card">
                  <div className="aspiration-card-header">
                    <div className="card-meta">
                      <span className="badge badge-category">{item.category}</span>
                      <span className={`badge ${item.status === 'replied' ? 'badge-replied' : 'badge-pending'}`}>
                        {item.status === 'replied' ? 'Telah Dibalas' : 'Menunggu'}
                      </span>
                    </div>
                    <span className="card-date">{formatDate(item.created_at)}</span>
                  </div>

                  <p className="aspiration-message">{item.message}</p>

                  {item.status === 'replied' && item.reply && (
                    <div className="admin-reply-box">
                      <div className="reply-header">
                        <span>Tanggapan Admin FTKOM</span>
                        <span className="reply-date">{formatDate(item.replied_at)}</span>
                      </div>
                      <p className="reply-content">{item.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
