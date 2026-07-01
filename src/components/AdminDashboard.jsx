import React, { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../App'
import { Inbox, CheckCircle, Clock, Search, MessageSquare, RefreshCw, Send, Edit } from 'lucide-react'

function AdminDashboard({ user, showToast }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterJurusan, setFilterJurusan] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  
  // Track open reply forms by aspiration ID: { [id]: replyText }
  const [replies, setReplies] = useState({})
  // Track which cards are actively editing replies: { [id]: boolean }
  const [editingId, setEditingId] = useState(null)
  const [submittingReply, setSubmittingReply] = useState({})

  const fetchAspirations = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/get_aspirasi.php?role=admin`)
      const resData = await response.json()
      if (response.ok && resData.status === 'success') {
        setData(resData.data)
      } else {
        throw new Error(resData.message || 'Gagal memuat data')
      }
    } catch (err) {
      console.error(err)
      showToast('Gagal memuat data surat aspirasi', 'error')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchAspirations()
  }, [fetchAspirations])

  const handleReplySubmit = async (e, id) => {
    e.preventDefault()
    const replyText = replies[id] ? replies[id].trim() : ''
    
    if (!replyText) {
      showToast('Balasan tidak boleh kosong!', 'error')
      return
    }

    setSubmittingReply(prev => ({ ...prev, [id]: true }))
    try {
      const response = await fetch(`${API_BASE}/reply_aspirasi.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, reply: replyText }),
      })

      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.message || 'Gagal mengirim balasan')
      }

      showToast(resData.message || 'Balasan berhasil dikirim!', 'success')
      setReplies(prev => ({ ...prev, [id]: '' }))
      setEditingId(null)
      fetchAspirations(true) // Refresh feed silently
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmittingReply(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleReplyChange = (id, text) => {
    setReplies(prev => ({ ...prev, [id]: text }))
  }

  const handleEditClick = (item) => {
    setReplies(prev => ({ ...prev, [item.id]: item.reply || '' }))
    setEditingId(item.id)
  }

  // Stats calculations
  const totalCount = data.length
  const pendingCount = data.filter(item => item.status === 'pending').length
  const repliedCount = data.filter(item => item.status === 'replied').length

  // Filtered data logic
  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.message.toLowerCase().includes(search.toLowerCase())
    
    const matchesJurusan = filterJurusan === 'All' || item.jurusan === filterJurusan
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus

    return matchesSearch && matchesJurusan && matchesStatus
  })

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  return (
    <div className="dashboard-container" style={{ margin: '1.5rem auto' }}>
      {/* Stats Cards Row */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <Inbox size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{totalCount}</span>
            <span className="stat-label">Total Masuk</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{pendingCount}</span>
            <span className="stat-label">Belum Dibalas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon replied">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{repliedCount}</span>
            <span className="stat-label">Telah Dibalas</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="filter-bar">
        <div className="filter-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari nama mahasiswa atau isi pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
          />
        </div>

        <div className="filter-select-wrapper">
          <Clock size={18} />
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
          >
            <option value="All">Semua Status</option>
            <option value="pending">Belum Dibalas</option>
            <option value="replied">Telah Dibalas</option>
          </select>
        </div>

        <div className="filter-select-wrapper">
          <Inbox size={18} />
          <select 
            className="filter-select"
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
            style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
          >
            <option value="All">Semua Jurusan</option>
            <option value="Teknik Informatika">Teknik Informatika</option>
            <option value="Sistem Informasi">Sistem Informasi</option>
            <option value="Teknik Komputer">Teknik Komputer</option>
            <option value="Teknologi Informasi">Teknologi Informasi</option>
          </select>
        </div>
      </div>

      {/* Main List Container */}
      <div className="dashboard-card" style={{ width: '100%' }}>
        <div className="feed-header">
          <h3 className="card-title" style={{ margin: 0 }}>
            <Inbox size={22} className="text-primary" style={{ color: 'var(--primary)' }} />
            Daftar Aspirasi Masuk ({filteredData.length})
          </h3>
          <button 
            type="button"
            onClick={() => fetchAspirations()} 
            className="btn-secondary btn-small"
            title="Refresh"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem' }}
          >
            <RefreshCw size={14} className={loading ? "spinner" : ""} />
            Aktualkan
          </button>
        </div>

        {loading && data.length === 0 ? (
          <div className="empty-state">
            <svg className="spinner" viewBox="0 0 50 50">
              <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
            </svg>
            <p>Memuat data aspirasi...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} style={{ color: '#cbd5e1' }} />
            <p style={{ marginTop: '0.5rem' }}>Tidak menemukan surat aspirasi yang cocok.</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Coba sesuaikan kata kunci pencarian atau filter status dan jurusan Anda.</span>
          </div>
        ) : (
          <div className="feed-list" style={{ maxHeight: 'none' }}>
            {filteredData.map((item) => {
              const isEditing = editingId === item.id
              const hasReply = item.status === 'replied' && item.reply

              return (
                <div key={item.id} className="aspiration-card">
                  <div className="aspiration-card-header">
                    <div className="sender-info">
                      <span className="sender-name">{item.name}</span>
                      <span className="sender-jurusan">{item.jurusan}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span className="card-date">{formatDate(item.created_at)}</span>
                      <div className="card-meta">
                        <span className="badge badge-category">{item.category}</span>
                        <span className={`badge ${item.status === 'replied' ? 'badge-replied' : 'badge-pending'}`}>
                          {item.status === 'replied' ? 'Telah Dibalas' : 'Belum Dibalas'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="aspiration-message">{item.message}</p>

                  {/* Reply Presentation */}
                  {hasReply && !isEditing && (
                    <div className="admin-reply-box">
                      <div className="reply-header">
                        <span>Balasan Anda</span>
                        <span className="reply-date">{formatDate(item.replied_at)}</span>
                      </div>
                      <p className="reply-content">{item.reply}</p>
                      <button 
                        type="button"
                        onClick={() => handleEditClick(item)} 
                        className="btn-reply-toggle"
                        style={{ marginTop: '0.5rem' }}
                      >
                        <Edit size={14} /> Ubah Balasan
                      </button>
                    </div>
                  )}

                  {/* Reply Input Form (rendered if pending or if edit mode is toggled) */}
                  {(!hasReply || isEditing) && (
                    <div className="reply-trigger-section">
                      <form onSubmit={(e) => handleReplySubmit(e, item.id)} className="reply-textarea-wrapper">
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {isEditing ? 'Ubah Tanggapan/Balasan Resmi' : 'Tulis Tanggapan/Balasan Resmi'}
                        </label>
                        <textarea
                          placeholder="Tulis balasan resmi fakultas di sini..."
                          value={replies[item.id] || ''}
                          onChange={(e) => handleReplyChange(item.id, e.target.value)}
                          style={{ padding: '0.75rem 1rem', width: '100%', minHeight: '90px' }}
                          required
                        ></textarea>
                        
                        <div className="reply-actions">
                          {isEditing && (
                            <button 
                              type="button" 
                              onClick={() => setEditingId(null)} 
                              className="btn-secondary btn-small"
                              disabled={submittingReply[item.id]}
                            >
                              Batal
                            </button>
                          )}
                          <button 
                            type="submit" 
                            className="btn-primary btn-small"
                            style={{ width: 'auto', alignSelf: 'flex-end' }}
                            disabled={submittingReply[item.id]}
                          >
                            {submittingReply[item.id] ? (
                              <svg className="spinner" viewBox="0 0 50 50" style={{ width: '14px', height: '14px' }}>
                                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                              </svg>
                            ) : (
                              <>
                                <Send size={14} /> Kirim Balasan
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
