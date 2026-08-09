import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const UNITS = [
  { id: 1, owner: 'Ahmad Rizal', phone: '012-3456789', lokasi: 'Ampang, Selangor', paras: 82, status: 'aktif', solar: 18.4, bateri: 76, warranti: 'Jan 2028', dashboard: 'aktif', servis: '1 Mei 2026', model: 'SuHu Pro', siri: 'SH-2026-0042' },
  { id: 2, owner: 'Siti Mariam', phone: '011-2345678', lokasi: 'Cheras, KL', paras: 65, status: 'aktif', solar: 17.2, bateri: 60, warranti: 'Mac 2027', dashboard: 'aktif', servis: '10 Apr 2026', model: 'SuHu Starter', siri: 'SH-2026-0018' },
  { id: 3, owner: 'Hafiz Zaki', phone: '013-3456789', lokasi: 'Puchong, Selangor', paras: 40, status: 'selenggara', solar: 0, bateri: 20, warranti: 'Nov 2027', dashboard: 'aktif', servis: '3 Jun 2026', model: 'SuHu Pro', siri: 'SH-2026-0031' },
  { id: 4, owner: 'Nurul Huda', phone: '019-4567890', lokasi: 'Kajang, Selangor', paras: 91, status: 'aktif', solar: 19.1, bateri: 88, warranti: 'Feb 2028', dashboard: 'aktif', servis: '20 Mar 2026', model: 'SuHu Pro', siri: 'SH-2026-0055' },
  { id: 5, owner: 'Zulkifli Md', phone: '017-5678901', lokasi: 'Semenyih, Selangor', paras: 55, status: 'aktif', solar: 15.8, bateri: 50, warranti: 'Jul 2026', dashboard: 'hampir tamat', servis: '15 Feb 2026', model: 'SuHu Starter', siri: 'SH-2025-0009' },
  { id: 6, owner: 'Faizal Harun', phone: '016-6789012', lokasi: 'Rawang, Selangor', paras: 73, status: 'aktif', solar: 16.5, bateri: 65, warranti: 'Sep 2027', dashboard: 'aktif', servis: '5 Apr 2026', model: 'SuHu Starter', siri: 'SH-2026-0022' },
]

const MAINTENANCE = [
  { owner: 'Hafiz Zaki', lokasi: 'Puchong', isu: 'Sensor ultrasonic diganti', tarikh: '3 Jun 2026', status: 'selenggara' },
  { owner: 'Ahmad Rizal', lokasi: 'Ampang', isu: 'Servis tahunan selesai', tarikh: '1 Mei 2026', status: 'selesai' },
  { owner: 'Zulkifli Md', lokasi: 'Semenyih', isu: 'Warranti tamat 15 Jul 2026', tarikh: '15 Jul 2026', status: 'segera' },
  { owner: 'Siti Mariam', lokasi: 'Cheras', isu: 'Bateri diganti', tarikh: '10 Apr 2026', status: 'selesai' },
]

const NAV_ITEMS = [
  { id: 'overview', icon: 'ti-layout-dashboard', label: 'Overview', section: 'Utama' },
  { id: 'units', icon: 'ti-list', label: 'Semua Unit', section: 'Utama' },
  { id: 'map', icon: 'ti-map-pin', label: 'Peta Lokasi', section: 'Utama' },
  { id: 'maintenance', icon: 'ti-tool', label: 'Penyelenggaraan', section: 'Pengurusan' },
  { id: 'warranty', icon: 'ti-certificate', label: 'Warranti', section: 'Pengurusan' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const stats = {
    total: UNITS.length,
    aktif: UNITS.filter(u => u.status === 'aktif').length,
    selenggara: UNITS.filter(u => u.status === 'selenggara').length,
    warrantiExpiring: UNITS.filter(u => u.warranti === 'hampir tamat' || u.dashboard === 'hampir tamat').length,
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleTabChange = (id) => {
    setActiveTab(id)
    setMobileMenuOpen(false)
  }

  const statusBadge = (status) => {
    const map = {
      aktif: { bg: 'rgba(29,158,117,0.15)', color: '#4ecca3', text: 'Aktif' },
      selenggara: { bg: 'rgba(239,159,39,0.15)', color: '#EF9F27', text: 'Selenggara' },
      segera: { bg: 'rgba(226,75,74,0.15)', color: '#E24B4A', text: 'Segera' },
      selesai: { bg: 'rgba(29,158,117,0.15)', color: '#4ecca3', text: 'Selesai' },
      'hampir tamat': { bg: 'rgba(239,159,39,0.15)', color: '#EF9F27', text: 'Hampir Tamat' },
    }
    const s = map[status] || map.aktif
    return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>{s.text}</span>
  }

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', background: '#0a0a0f', color: '#fff' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; margin: 0; padding: 0; background: #0a0a0f; display: block; text-align: left; border: none; }

        /* Layout */
        .admin-layout { display: flex; flex: 1; min-height: 100vh; }
        .admin-sidebar { width: 220px; min-height: 100vh; background: #0d0d14; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .admin-main { flex: 1; min-width: 0; padding: 32px; overflow-y: auto; }

        /* Sidebar styles */
        .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 20px 20px 24px; font-size: 17px; font-weight: 700; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer; }
        .sidebar-logo-dot { width: 28px; height: 28px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .sidebar-badge { font-size: 9px; background: rgba(29,158,117,0.2); color: #4ecca3; padding: 2px 7px; border-radius: 999px; margin-left: auto; font-weight: 700; letter-spacing: 0.04em; }
        .sidebar-section { padding: 16px 12px 8px; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: 0.08em; text-transform: uppercase; }
        .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 13px; color: rgba(255,255,255,0.5); cursor: pointer; margin: 1px 8px; transition: all 0.15s; border: none; background: none; width: calc(100% - 16px); text-align: left; font-family: inherit; }
        .sidebar-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .sidebar-item.active { background: rgba(29,158,117,0.15); color: #4ecca3; }
        .sidebar-item i { font-size: 16px; flex-shrink: 0; }
        .sidebar-bottom { margin-top: auto; padding: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
        .sidebar-user { display: flex; align-items: center; gap: 10px; }
        .sidebar-avatar { width: 32px; height: 32px; border-radius: 50%; background: rgba(29,158,117,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #4ecca3; font-weight: 700; flex-shrink: 0; }
        .sidebar-user-name { font-size: 12px; font-weight: 600; color: #fff; }
        .sidebar-user-role { font-size: 10px; color: rgba(255,255,255,0.35); }
        .sidebar-logout { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 18px; margin-left: auto; padding: 4px; transition: color 0.15s; line-height: 1; }
        .sidebar-logout:hover { color: #f87171; }

        /* Mobile topbar */
        .mobile-topbar { display: none; justify-content: space-between; align-items: center; padding: 14px 20px; background: #0d0d14; border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 40; }
        .mobile-logo { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #fff; }
        .mobile-logo-dot { width: 26px; height: 26px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .mobile-right { display: flex; align-items: center; gap: 8px; }
        .mobile-badge { font-size: 9px; background: rgba(29,158,117,0.2); color: #4ecca3; padding: 2px 7px; border-radius: 999px; font-weight: 700; }
        .mobile-hamburger { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; padding: 7px 10px; cursor: pointer; font-size: 16px; line-height: 1; }

        /* Mobile menu overlay */
        .mobile-menu-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 45; }
        .mobile-menu-overlay.open { display: block; }
        .mobile-menu { position: fixed; top: 0; left: 0; bottom: 0; width: 260px; background: #0d0d14; z-index: 50; display: flex; flex-direction: column; transform: translateX(-100%); transition: transform 0.25s; border-right: 1px solid rgba(255,255,255,0.06); }
        .mobile-menu.open { transform: translateX(0); }
        .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .mobile-menu-logo { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #fff; }
        .mobile-menu-close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 20px; padding: 4px; line-height: 1; }
        .mobile-menu-close:hover { color: #fff; }
        .mobile-menu-body { flex: 1; overflow-y: auto; padding: 8px 0; }
        .mobile-menu-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
        .mobile-user { display: flex; align-items: center; gap: 10px; }
        .mobile-logout { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(226,75,74,0.08); border: 1px solid rgba(226,75,74,0.15); color: #f87171; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 12px; }
        .mobile-logout:hover { background: rgba(226,75,74,0.15); }

        /* Content */
        .page-header { margin-bottom: 28px; }
        .page-title { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: rgba(255,255,255,0.4); }

        .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
        .stat-box { background: #111118; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 18px 20px; }
        .stat-box-val { font-size: 28px; font-weight: 700; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
        .stat-box-label { font-size: 12px; color: rgba(255,255,255,0.4); }

        .section-card { background: #111118; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px 22px; margin-bottom: 16px; }
        .section-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .section-title i { font-size: 16px; color: rgba(255,255,255,0.4); }

        .unit-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .unit-table th { color: rgba(255,255,255,0.35); font-weight: 500; text-align: left; padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
        .unit-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.75); vertical-align: middle; }
        .unit-table tr:last-child td { border-bottom: none; }
        .unit-table tr:hover td { background: rgba(255,255,255,0.02); cursor: pointer; }
        .unit-table tr.selected td { background: rgba(29,158,117,0.06); }

        .progress-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; width: 80px; display: inline-block; vertical-align: middle; margin-right: 6px; }
        .progress-fill { height: 100%; border-radius: 999px; }

        .maint-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .maint-item:last-child { border-bottom: none; }
        .maint-icon { width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .maint-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .maint-sub { font-size: 11px; color: rgba(255,255,255,0.35); }

        .map-box { height: 200px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; color: rgba(255,255,255,0.3); font-size: 13px; }
        .map-box i { font-size: 28px; }

        /* Detail panel */
        .detail-panel { background: #0d0d14; border-left: 1px solid rgba(255,255,255,0.06); width: 300px; padding: 24px 20px; position: fixed; right: 0; top: 0; bottom: 0; overflow-y: auto; z-index: 50; transform: translateX(100%); transition: transform 0.25s; }
        .detail-panel.open { transform: translateX(0); }
        .detail-close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 18px; padding: 4px; float: right; }
        .detail-close:hover { color: #fff; }
        .detail-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px; margin-top: 8px; }
        .detail-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 20px; }
        .detail-section { margin-bottom: 18px; }
        .detail-section-title { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; }
        .detail-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 12px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: rgba(255,255,255,0.4); }
        .detail-val { color: #fff; font-weight: 500; }
        .detail-metric { background: rgba(255,255,255,0.04); border-radius: 8px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .detail-metric-val { font-size: 20px; font-weight: 700; color: #fff; }
        .detail-metric-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* Responsive */
        @media (max-width: 900px) {
          .admin-sidebar { display: none; }
          .mobile-topbar { display: flex; }
          .admin-main { padding: 20px 16px; }
          .stats-row { grid-template-columns: repeat(2,1fr); }
          .two-col { grid-template-columns: 1fr; }
          .detail-panel { width: 100%; }
        }
      `}</style>

      {/* ── MOBILE TOPBAR ── */}
      <div className="mobile-topbar">
        <div className="mobile-logo">
          <div className="mobile-logo-dot">💧</div>
          SuHu
          <span className="mobile-badge">ADMIN</span>
        </div>
        <div className="mobile-right">
          <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(true)}>☰</button>
        </div>
      </div>

      {/* ── MOBILE MENU OVERLAY ── */}
      <div className={`mobile-menu-overlay${mobileMenuOpen ? ' open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      {/* ── MOBILE MENU DRAWER ── */}
      <div className={`mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-logo">
            <div className="mobile-logo-dot">💧</div>
            SuHu
          </div>
          <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
        </div>

        <div className="mobile-menu-body">
          <div className="sidebar-section">Utama</div>
          {NAV_ITEMS.filter(i => i.section === 'Utama').map(item => (
            <button key={item.id} className={`sidebar-item${activeTab === item.id ? ' active' : ''}`} onClick={() => handleTabChange(item.id)}>
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              {item.label}
            </button>
          ))}
          <div className="sidebar-section">Pengurusan</div>
          {NAV_ITEMS.filter(i => i.section === 'Pengurusan').map(item => (
            <button key={item.id} className={`sidebar-item${activeTab === item.id ? ' active' : ''}`} onClick={() => handleTabChange(item.id)}>
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mobile-menu-footer">
          <div className="mobile-user">
            <div className="sidebar-avatar">K</div>
            <div>
              <div className="sidebar-user-name">Ir. Ts. Khalil</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </div>
          <button className="mobile-logout" onClick={handleLogout}>
            ⏻ Log Keluar
          </button>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="admin-layout">

        {/* ── SIDEBAR (DESKTOP) ── */}
        <aside className="admin-sidebar">
          <div className="sidebar-logo" onClick={() => navigate('/')}>
            <div className="sidebar-logo-dot">💧</div>
            SuHu
            <span className="sidebar-badge">ADMIN</span>
          </div>

          <div className="sidebar-section">Utama</div>
          {NAV_ITEMS.filter(i => i.section === 'Utama').map(item => (
            <button key={item.id} className={`sidebar-item${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              {item.label}
            </button>
          ))}

          <div className="sidebar-section">Pengurusan</div>
          {NAV_ITEMS.filter(i => i.section === 'Pengurusan').map(item => (
            <button key={item.id} className={`sidebar-item${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              {item.label}
            </button>
          ))}

          <div className="sidebar-bottom">
            <div className="sidebar-user">
              <div className="sidebar-avatar">K</div>
              <div>
                <div className="sidebar-user-name">Ir. Ts. Khalil</div>
                <div className="sidebar-user-role">Administrator</div>
              </div>
              <button className="sidebar-logout" onClick={handleLogout} title="Log keluar">⏻</button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="admin-main">

          {activeTab === 'overview' && (
            <>
              <div className="page-header">
                <div className="page-title">Overview</div>
                <div className="page-sub">Kemaskini terakhir: 10 Jun 2026, 14:32</div>
              </div>
              <div className="stats-row">
                <div className="stat-box"><div className="stat-box-val">{stats.total}</div><div className="stat-box-label">Jumlah unit berdaftar</div></div>
                <div className="stat-box"><div className="stat-box-val" style={{ color: '#1D9E75' }}>{stats.aktif}</div><div className="stat-box-label">Unit aktif</div></div>
                <div className="stat-box"><div className="stat-box-val" style={{ color: '#EF9F27' }}>{stats.selenggara}</div><div className="stat-box-label">Perlu penyelenggaraan</div></div>
                <div className="stat-box"><div className="stat-box-val" style={{ color: '#E24B4A' }}>{stats.warrantiExpiring}</div><div className="stat-box-label">Warranti hampir tamat</div></div>
              </div>
              <div className="two-col">
                <div className="section-card">
                  <div className="section-title"><i className="ti ti-list" aria-hidden="true" /> Unit Terkini</div>
                  <table className="unit-table">
                    <thead><tr><th>Owner</th><th>Lokasi</th><th>Status</th></tr></thead>
                    <tbody>
                      {UNITS.slice(0, 5).map(u => (
                        <tr key={u.id} onClick={() => { setSelectedUnit(u); setDetailOpen(true) }}>
                          <td>{u.owner}</td>
                          <td style={{ color: 'rgba(255,255,255,0.4)' }}>{u.lokasi}</td>
                          <td>{statusBadge(u.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="section-card">
                  <div className="section-title"><i className="ti ti-tool" aria-hidden="true" /> Penyelenggaraan Terkini</div>
                  {MAINTENANCE.map((m, i) => (
                    <div key={i} className="maint-item">
                      <div className="maint-icon"><i className={`ti ${m.status === 'selesai' ? 'ti-check' : m.status === 'segera' ? 'ti-alert-triangle' : 'ti-settings'}`} aria-hidden="true" /></div>
                      <div style={{ flex: 1 }}>
                        <div className="maint-title">{m.owner} — {m.lokasi}</div>
                        <div className="maint-sub">{m.isu} · {m.tarikh}</div>
                      </div>
                      {statusBadge(m.status)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'units' && (
            <>
              <div className="page-header">
                <div className="page-title">Semua Unit Berdaftar</div>
                <div className="page-sub">{UNITS.length} unit · Klik baris untuk lihat detail</div>
              </div>
              <div className="section-card">
                <table className="unit-table">
                  <thead>
                    <tr><th>Owner</th><th>Telefon</th><th>Lokasi</th><th>Model</th><th>Paras Air</th><th>Solar</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {UNITS.map(u => (
                      <tr key={u.id} className={selectedUnit?.id === u.id ? 'selected' : ''} onClick={() => { setSelectedUnit(u); setDetailOpen(true) }}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{u.owner}</td>
                        <td style={{ color: 'rgba(255,255,255,0.4)' }}>{u.phone}</td>
                        <td style={{ color: 'rgba(255,255,255,0.4)' }}>{u.lokasi}</td>
                        <td>{u.model}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: u.paras + '%', background: u.paras > 60 ? '#1D9E75' : u.paras > 30 ? '#EF9F27' : '#E24B4A' }} /></div>
                            {u.paras}%
                          </div>
                        </td>
                        <td>{u.solar}V</td>
                        <td>{statusBadge(u.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'map' && (
            <>
              <div className="page-header">
                <div className="page-title">Peta Lokasi Unit</div>
                <div className="page-sub">{UNITS.length} unit di seluruh Selangor & KL</div>
              </div>
              <div className="section-card">
                <div className="map-box">
                  <i className="ti ti-map" aria-hidden="true" />
                  <span>Google Maps API — akan disambung selepas setup Supabase</span>
                  <span style={{ fontSize: 11 }}>Pin akan tunjuk lokasi setiap unit</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <table className="unit-table">
                    <thead><tr><th>Owner</th><th>Lokasi</th><th>Paras Air</th><th>Status</th></tr></thead>
                    <tbody>
                      {UNITS.map(u => (
                        <tr key={u.id} onClick={() => { setSelectedUnit(u); setDetailOpen(true) }}>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{u.owner}</td>
                          <td style={{ color: 'rgba(255,255,255,0.4)' }}>{u.lokasi}</td>
                          <td>{u.paras}%</td>
                          <td>{statusBadge(u.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'maintenance' && (
            <>
              <div className="page-header">
                <div className="page-title">Sejarah Penyelenggaraan</div>
                <div className="page-sub">Rekod servis dan penyelenggaraan semua unit</div>
              </div>
              <div className="section-card">
                {MAINTENANCE.map((m, i) => (
                  <div key={i} className="maint-item">
                    <div className="maint-icon"><i className={`ti ${m.status === 'selesai' ? 'ti-check' : m.status === 'segera' ? 'ti-alert-triangle' : 'ti-settings'}`} aria-hidden="true" /></div>
                    <div style={{ flex: 1 }}>
                      <div className="maint-title">{m.owner} — {m.lokasi}</div>
                      <div className="maint-sub">{m.isu} · {m.tarikh}</div>
                    </div>
                    {statusBadge(m.status)}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'warranty' && (
            <>
              <div className="page-header">
                <div className="page-title">Status Warranti & Langganan</div>
                <div className="page-sub">Semak tarikh tamat warranti dan dashboard</div>
              </div>
              <div className="section-card">
                <table className="unit-table">
                  <thead>
                    <tr><th>Owner</th><th>Model</th><th>No. Siri</th><th>Tamat Warranti</th><th>Dashboard</th><th>Servis Terakhir</th></tr>
                  </thead>
                  <tbody>
                    {UNITS.map(u => (
                      <tr key={u.id} onClick={() => { setSelectedUnit(u); setDetailOpen(true) }}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{u.owner}</td>
                        <td>{u.model}</td>
                        <td style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 11 }}>{u.siri}</td>
                        <td>{u.warranti}</td>
                        <td>{statusBadge(u.dashboard === 'aktif' ? 'aktif' : 'hampir tamat')}</td>
                        <td style={{ color: 'rgba(255,255,255,0.4)' }}>{u.servis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </main>
      </div>

      {/* ── DETAIL PANEL (SLIDE-IN) ── */}
      <div className={`detail-panel${detailOpen && selectedUnit ? ' open' : ''}`}>
        {selectedUnit && (
          <>
            <button className="detail-close" onClick={() => setDetailOpen(false)}>
              <i className="ti ti-x" aria-hidden="true" />
            </button>
            <div className="detail-title">{selectedUnit.owner}</div>
            <div className="detail-sub">{selectedUnit.lokasi}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
              <div className="detail-metric">
                <div><div className="detail-metric-val">{selectedUnit.paras}%</div><div className="detail-metric-label">Paras air</div></div>
                <span style={{ fontSize: 20 }}>💧</span>
              </div>
              <div className="detail-metric">
                <div><div className="detail-metric-val">{selectedUnit.bateri}%</div><div className="detail-metric-label">Bateri</div></div>
                <span style={{ fontSize: 20 }}>🔋</span>
              </div>
            </div>
            <div className="detail-section">
              <div className="detail-section-title">Maklumat Unit</div>
              <div className="detail-row"><span className="detail-label">Model</span><span className="detail-val">{selectedUnit.model}</span></div>
              <div className="detail-row"><span className="detail-label">No. Siri</span><span className="detail-val" style={{ fontFamily: 'monospace', fontSize: 11 }}>{selectedUnit.siri}</span></div>
              <div className="detail-row"><span className="detail-label">Telefon</span><span className="detail-val">{selectedUnit.phone}</span></div>
              <div className="detail-row"><span className="detail-label">Output Solar</span><span className="detail-val">{selectedUnit.solar}V</span></div>
            </div>
            <div className="detail-section">
              <div className="detail-section-title">Warranti & Servis</div>
              <div className="detail-row"><span className="detail-label">Tamat Warranti</span><span className="detail-val">{selectedUnit.warranti}</span></div>
              <div className="detail-row"><span className="detail-label">Dashboard</span><span className="detail-val">{selectedUnit.dashboard}</span></div>
              <div className="detail-row"><span className="detail-label">Servis Terakhir</span><span className="detail-val">{selectedUnit.servis}</span></div>
            </div>
            <div className="detail-section">
              <div className="detail-section-title">Status</div>
              <div style={{ marginTop: 4 }}>{statusBadge(selectedUnit.status)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}