import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LOG_DATA = [
  { masa: '14:32', paras: 82, hujan: 'Ya', solar: 18.4, bateri: 76 },
  { masa: '14:27', paras: 80, hujan: 'Ya', solar: 18.1, bateri: 75 },
  { masa: '14:22', paras: 79, hujan: 'Rintik', solar: 17.8, bateri: 74 },
  { masa: '14:17', paras: 79, hujan: 'Rintik', solar: 16.9, bateri: 73 },
  { masa: '14:12', paras: 78, hujan: 'Tidak', solar: 16.5, bateri: 72 },
  { masa: '14:07', paras: 78, hujan: 'Tidak', solar: 16.2, bateri: 71 },
  { masa: '14:02', paras: 77, hujan: 'Tidak', solar: 15.8, bateri: 70 },
  { masa: '13:57', paras: 77, hujan: 'Tidak', solar: 15.5, bateri: 70 },
]

const WEATHER = [
  { hari: 'Hari ini', icon: '🌧️', hujan: '12mm', suhu: '27°C' },
  { hari: 'Esok', icon: '⛅', hujan: '3mm', suhu: '29°C' },
  { hari: 'Rab', icon: '☀️', hujan: '0mm', suhu: '32°C' },
  { hari: 'Kha', icon: '🌧️', hujan: '18mm', suhu: '26°C' },
  { hari: 'Jum', icon: '⛅', hujan: '5mm', suhu: '28°C' },
  { hari: 'Sab', icon: '☀️', hujan: '0mm', suhu: '33°C' },
  { hari: 'Ahad', icon: '🌦️', hujan: '8mm', suhu: '27°C' },
]

export default function UserDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileSidebar, setMobileSidebar] = useState(false)

  const paras = 82
  const bateri = 76
  const solar = 18.4

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', background: '#0a0a0f', color: '#fff' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; margin: 0; padding: 0; background: #0a0a0f; display: block; text-align: left; border: none; }

        .user-content-row { display: flex; flex: 1; min-height: 0; width: 100%; }
        .user-sidebar { width: 220px; min-height: 100vh; background: #0d0d14; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .user-main { flex: 1; min-width: 0; padding: 32px; overflow-y: auto; }

        .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 20px 20px 24px; font-size: 17px; font-weight: 700; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer; }
        .sidebar-logo-dot { width: 28px; height: 28px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
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
        .sidebar-logout { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 16px; margin-left: auto; padding: 4px; }
        .sidebar-logout:hover { color: rgba(255,255,255,0.6); }

        /* Mobile nav */
        .mobile-nav { display: none; justify-content: space-between; align-items: center; padding: 14px 20px; background: #0d0d14; border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 50; }
        .mobile-logo { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #fff; }
        .hamburger { background: none; border: 1px solid rgba(255,255,255,0.12); border-radius: 7px; color: #fff; padding: 6px 10px; cursor: pointer; font-size: 16px; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: #0d0d14; z-index: 100; padding: 20px; flex-direction: column; gap: 4px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu-close { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 22px; cursor: pointer; align-self: flex-end; margin-bottom: 16px; }

        .page-header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
        .page-title { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: rgba(255,255,255,0.4); }
        .online-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(29,158,117,0.15); color: #4ecca3; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(29,158,117,0.25); }
        .online-dot { width: 7px; height: 7px; border-radius: 50%; background: #1D9E75; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .metrics-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
        .metric-card { background: #111118; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 18px 16px; }
        .metric-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .metric-label i { font-size: 14px; }
        .metric-val { font-size: 28px; font-weight: 700; color: #fff; line-height: 1; letter-spacing: -0.5px; }
        .metric-unit { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; }
        .metric-sub { font-size: 11px; margin-top: 6px; display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px; }
        .sub-green { background: rgba(29,158,117,0.15); color: #4ecca3; }
        .sub-amber { background: rgba(239,159,39,0.15); color: #EF9F27; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .full-col { margin-bottom: 16px; }

        .section-card { background: #111118; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px 22px; }
        .section-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .section-title i { font-size: 15px; color: rgba(255,255,255,0.35); }

        /* Tank SVG */
        .tank-wrap { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        .tank-info { flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .tank-info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
        .tank-info-row:last-child { border-bottom: none; }
        .tank-info-label { color: rgba(255,255,255,0.4); }
        .tank-info-val { color: #fff; font-weight: 500; }

        /* Bar */
        .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .bar-row:last-child { margin-bottom: 0; }
        .bar-label { font-size: 12px; color: rgba(255,255,255,0.4); width: 54px; flex-shrink: 0; }
        .bar-track { flex: 1; height: 8px; background: rgba(255,255,255,0.07); border-radius: 999px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 999px; transition: width 0.5s; }
        .bar-val { font-size: 12px; color: #fff; font-weight: 500; width: 44px; text-align: right; }

        /* Weather */
        .weather-scroll { display: grid; grid-template-columns: repeat(7,1fr); gap: 8px; }
        .weather-day { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px 8px; text-align: center; }
        .weather-day.today { border-color: rgba(29,158,117,0.3); background: rgba(29,158,117,0.06); }
        .weather-day-name { font-size: 10px; color: rgba(255,255,255,0.35); margin-bottom: 6px; }
        .weather-day-icon { font-size: 20px; margin-bottom: 6px; }
        .weather-day-rain { font-size: 11px; color: #60a5fa; font-weight: 600; margin-bottom: 2px; }
        .weather-day-temp { font-size: 10px; color: rgba(255,255,255,0.35); }

        /* Log table */
        .log-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .log-table th { color: rgba(255,255,255,0.3); font-weight: 500; text-align: left; padding: 6px 10px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
        .log-table td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.7); }
        .log-table tr:last-child td { border-bottom: none; }
        .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 5px; }
        .dot-g { background: #1D9E75; }
        .dot-a { background: #EF9F27; }
        .dot-r { background: rgba(255,255,255,0.2); }

        /* Equipment info */
        .equip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .equip-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
        .equip-row:last-child { border-bottom: none; }
        .equip-label { color: rgba(255,255,255,0.4); }
        .equip-val { color: #fff; font-weight: 500; }
        .equip-col { padding: 0 8px; }
        .equip-col:first-child { padding-left: 0; border-right: 1px solid rgba(255,255,255,0.05); }
        .equip-col:last-child { padding-right: 0; }

        /* Tetapan */
        .settings-section { margin-bottom: 24px; }
        .settings-title { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 12px; }
        .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .settings-row:last-child { border-bottom: none; }
        .settings-label { font-size: 14px; color: #fff; font-weight: 500; }
        .settings-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .toggle { width: 42px; height: 24px; border-radius: 999px; background: rgba(29,158,117,0.5); border: none; cursor: pointer; position: relative; flex-shrink: 0; }
        .toggle::after { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #fff; top: 3px; right: 3px; }
        .toggle.off { background: rgba(255,255,255,0.12); }
        .toggle.off::after { right: auto; left: 3px; }
        .settings-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 13px; padding: 8px 12px; font-family: inherit; outline: none; width: 180px; }
        .settings-input:focus { border-color: rgba(29,158,117,0.5); }
        .btn-save { background: #1D9E75; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-save:hover { background: #178763; }
        .btn-danger { background: rgba(226,75,74,0.1); color: #E24B4A; border: 1px solid rgba(226,75,74,0.2); border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }

        @media (max-width: 900px) {
          .user-sidebar { display: none; }
          .mobile-nav { display: flex; }
          .user-main { padding: 20px 16px; }
          .metrics-grid { grid-template-columns: repeat(2,1fr); }
          .two-col { grid-template-columns: 1fr; }
          .three-col { grid-template-columns: 1fr; }
          .weather-scroll { grid-template-columns: repeat(4,1fr); }
          .equip-grid { grid-template-columns: 1fr; }
          .equip-col { border-right: none !important; padding: 0 !important; }
        }
        @media (max-width: 480px) {
          .metrics-grid { grid-template-columns: repeat(2,1fr); }
          .weather-scroll { grid-template-columns: repeat(4,1fr); }
        }
      `}</style>

      {/* ── MOBILE NAV ── */}
      <div className="mobile-nav">
        <div className="mobile-logo">
          <div className="sidebar-logo-dot">💧</div>
          SuHu
        </div>
        <button className="hamburger" onClick={() => setMobileSidebar(true)}>☰</button>
      </div>

      {/* Mobile menu */}
      {mobileSidebar && (
        <div className="mobile-menu open">
          <button className="mobile-menu-close" onClick={() => setMobileSidebar(false)}>✕</button>
          {[
            { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Tangki Saya' },
            { id: 'history', icon: 'ti-history', label: 'Sejarah Data' },
            { id: 'weather', icon: 'ti-cloud', label: 'Cuaca' },
            { id: 'equipment', icon: 'ti-tool', label: 'Peralatan & Warranti' },
            { id: 'settings', icon: 'ti-settings', label: 'Tetapan' },
          ].map(item => (
            <button key={item.id} className={`sidebar-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => { setActiveTab(item.id); setMobileSidebar(false) }}>
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              {item.label}
            </button>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button className="sidebar-item" onClick={() => navigate('/login')}>
              <i className="ti ti-logout" aria-hidden="true" /> Log Keluar
            </button>
          </div>
        </div>
      )}

      {/* ── SIDEBAR + MAIN ROW ── */}
      <div className="user-content-row">

      {/* ── SIDEBAR (DESKTOP) ── */}
      <aside className="user-sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')}>
          <div className="sidebar-logo-dot">💧</div>
          SuHu
        </div>
        <div className="sidebar-section">Dashboard</div>
        {[
          { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Tangki Saya' },
          { id: 'history', icon: 'ti-history', label: 'Sejarah Data' },
          { id: 'weather', icon: 'ti-cloud', label: 'Cuaca' },
        ].map(item => (
          <button key={item.id} className={`sidebar-item${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}
        <div className="sidebar-section">Akaun</div>
        {[
          { id: 'equipment', icon: 'ti-tool', label: 'Peralatan & Warranti' },
          { id: 'settings', icon: 'ti-settings', label: 'Tetapan' },
        ].map(item => (
          <button key={item.id} className={`sidebar-item${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">A</div>
            <div>
              <div className="sidebar-user-name">Ahmad Rizal</div>
              <div className="sidebar-user-role">Pengguna</div>
            </div>
            <button className="sidebar-logout" onClick={() => navigate('/login')}>
              <i className="ti ti-logout" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="user-main">

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Tangki Saya</div>
                <div className="page-sub">No. 12, Jalan Damai, Ampang · Kemaskini 2 min lalu</div>
              </div>
              <div className="online-badge">
                <div className="online-dot" /> Dalam Talian
              </div>
            </div>

            {/* Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label"><i className="ti ti-ripple" aria-hidden="true" /> Paras Air</div>
                <div className="metric-val">{paras}</div>
                <div className="metric-unit">% penuh</div>
                <span className="metric-sub sub-green">↑ Mengisi</span>
              </div>
              <div className="metric-card">
                <div className="metric-label"><i className="ti ti-cloud-rain" aria-hidden="true" /> Hujan</div>
                <div className="metric-val" style={{ fontSize: 22 }}>Ya</div>
                <div className="metric-unit">aktif sekarang</div>
                <span className="metric-sub sub-green">🌧️ Sedang turun</span>
              </div>
              <div className="metric-card">
                <div className="metric-label"><i className="ti ti-solar-panel" aria-hidden="true" /> Solar</div>
                <div className="metric-val">{solar}</div>
                <div className="metric-unit">V output</div>
                <span className="metric-sub sub-green">☀️ Optimum</span>
              </div>
              <div className="metric-card">
                <div className="metric-label"><i className="ti ti-battery-charging" aria-hidden="true" /> Bateri</div>
                <div className="metric-val">{bateri}</div>
                <div className="metric-unit">% caj</div>
                <span className="metric-sub sub-amber">⚡ Mengecas</span>
              </div>
            </div>

            <div className="two-col">
              {/* Tank visual */}
              <div className="section-card">
                <div className="section-title"><i className="ti ti-container" aria-hidden="true" /> Status Tangki</div>
                <div className="tank-wrap">
                  <svg width="64" height="110" viewBox="0 0 64 110" aria-label="Tangki 82% penuh">
                    <rect x="8" y="6" width="48" height="90" rx="6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
                    <rect x="10" y="8" width="44" height="86" rx="4" fill="rgba(255,255,255,0.03)"/>
                    <rect x="10" y="23" width="44" height="71" rx="0" fill="#1D9E75" fillOpacity="0.35"/>
                    <rect x="24" y="96" width="16" height="8" rx="3" fill="rgba(255,255,255,0.1)"/>
                    <text x="32" y="64" textAnchor="middle" fontSize="13" fontWeight="700" fill="#4ecca3">{paras}%</text>
                  </svg>
                  <div className="tank-info">
                    <div className="tank-info-row"><span className="tank-info-label">Isipadu</span><span className="tank-info-val">1,640 L</span></div>
                    <div className="tank-info-row"><span className="tank-info-label">Kapasiti</span><span className="tank-info-val">2,000 L</span></div>
                    <div className="tank-info-row"><span className="tank-info-label">Kadar isi</span><span className="tank-info-val">+12 L/jam</span></div>
                    <div className="tank-info-row"><span className="tank-info-label">Penuh dalam</span><span className="tank-info-val">~3.2 jam</span></div>
                  </div>
                </div>
                <div>
                  <div className="bar-row">
                    <span className="bar-label">Solar</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: '74%', background: '#EF9F27' }} /></div>
                    <span className="bar-val">18.4V</span>
                  </div>
                  <div className="bar-row">
                    <span className="bar-label">Bateri</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: bateri + '%', background: '#1D9E75' }} /></div>
                    <span className="bar-val">{bateri}%</span>
                  </div>
                </div>
              </div>

              {/* Log terkini */}
              <div className="section-card">
                <div className="section-title"><i className="ti ti-history" aria-hidden="true" /> Log Terkini</div>
                <table className="log-table">
                  <thead>
                    <tr><th>Masa</th><th>Paras</th><th>Hujan</th><th>Solar</th><th>Bateri</th></tr>
                  </thead>
                  <tbody>
                    {LOG_DATA.map((l, i) => (
                      <tr key={i}>
                        <td style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{l.masa}</td>
                        <td>{l.paras}%</td>
                        <td>
                          <span className={`dot ${l.hujan === 'Ya' ? 'dot-g' : l.hujan === 'Rintik' ? 'dot-a' : 'dot-r'}`} />
                          {l.hujan}
                        </td>
                        <td>{l.solar}V</td>
                        <td>{l.bateri}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weather */}
            <div className="section-card">
              <div className="section-title"><i className="ti ti-cloud" aria-hidden="true" /> Ramalan Cuaca 7 Hari — Ampang</div>
              <div className="weather-scroll">
                {WEATHER.map((w, i) => (
                  <div key={i} className={`weather-day${i === 0 ? ' today' : ''}`}>
                    <div className="weather-day-name">{w.hari}</div>
                    <div className="weather-day-icon">{w.icon}</div>
                    <div className="weather-day-rain">{w.hujan}</div>
                    <div className="weather-day-temp">{w.suhu}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SEJARAH DATA */}
        {activeTab === 'history' && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Sejarah Data</div>
                <div className="page-sub">Rekod sensor lengkap tangki anda</div>
              </div>
            </div>
            <div className="section-card">
              <div className="section-title"><i className="ti ti-table" aria-hidden="true" /> Log Sensor — 10 Jun 2026</div>
              <table className="log-table">
                <thead>
                  <tr><th>Masa</th><th>Paras Air</th><th>Hujan</th><th>Solar</th><th>Bateri</th></tr>
                </thead>
                <tbody>
                  {LOG_DATA.concat(LOG_DATA).map((l, i) => (
                    <tr key={i}>
                      <td style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{l.masa}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 60, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: l.paras + '%', background: '#1D9E75', borderRadius: 999 }} />
                          </div>
                          {l.paras}%
                        </div>
                      </td>
                      <td><span className={`dot ${l.hujan === 'Ya' ? 'dot-g' : l.hujan === 'Rintik' ? 'dot-a' : 'dot-r'}`} />{l.hujan}</td>
                      <td>{l.solar}V</td>
                      <td>{l.bateri}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* CUACA */}
        {activeTab === 'weather' && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Ramalan Cuaca</div>
                <div className="page-sub">Kawasan Ampang, Selangor · Open-Meteo API</div>
              </div>
            </div>
            <div className="section-card" style={{ marginBottom: 16 }}>
              <div className="section-title"><i className="ti ti-cloud" aria-hidden="true" /> 7 Hari ke Hadapan</div>
              <div className="weather-scroll">
                {WEATHER.map((w, i) => (
                  <div key={i} className={`weather-day${i === 0 ? ' today' : ''}`}>
                    <div className="weather-day-name">{w.hari}</div>
                    <div className="weather-day-icon">{w.icon}</div>
                    <div className="weather-day-rain">{w.hujan}</div>
                    <div className="weather-day-temp">{w.suhu}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="two-col">
              <div className="section-card">
                <div className="section-title"><i className="ti ti-droplet" aria-hidden="true" /> Jumlah Hujan Minggu Ini</div>
                <div style={{ fontSize: 40, fontWeight: 700, color: '#60a5fa', letterSpacing: -1 }}>46mm</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Jangkaan pengisian tangki: +920L</div>
              </div>
              <div className="section-card">
                <div className="section-title"><i className="ti ti-sun" aria-hidden="true" /> Hari Cerah Minggu Ini</div>
                <div style={{ fontSize: 40, fontWeight: 700, color: '#EF9F27', letterSpacing: -1 }}>3 hari</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Solar optimum dijangka Rabu & Sabtu</div>
              </div>
            </div>
          </>
        )}

        {/* PERALATAN & WARRANTI */}
        {activeTab === 'equipment' && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Peralatan & Warranti</div>
                <div className="page-sub">Maklumat unit SuHu anda</div>
              </div>
            </div>
            <div className="section-card" style={{ marginBottom: 16 }}>
              <div className="section-title"><i className="ti ti-info-circle" aria-hidden="true" /> Maklumat Unit</div>
              <div className="equip-grid">
                <div className="equip-col">
                  {[
                    { label: 'Model', val: 'SuHu Pro' },
                    { label: 'No. Siri', val: 'SH-2026-0042' },
                    { label: 'Tarikh Pasang', val: '15 Jan 2026' },
                    { label: 'Kapasiti Tangki', val: '2,000 Liter' },
                  ].map((r, i) => (
                    <div key={i} className="equip-row">
                      <span className="equip-label">{r.label}</span>
                      <span className="equip-val">{r.val}</span>
                    </div>
                  ))}
                </div>
                <div className="equip-col">
                  {[
                    { label: 'Tamat Warranti', val: 'Jan 2028', color: '#4ecca3' },
                    { label: 'Dashboard', val: 'Aktif (hingga Jan 2027)', color: '#4ecca3' },
                    { label: 'Servis Terakhir', val: '1 Mei 2026' },
                    { label: 'Servis Seterusnya', val: 'Jan 2027', color: '#EF9F27' },
                  ].map((r, i) => (
                    <div key={i} className="equip-row">
                      <span className="equip-label">{r.label}</span>
                      <span className="equip-val" style={r.color ? { color: r.color } : {}}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="section-card">
              <div className="section-title"><i className="ti ti-tool" aria-hidden="true" /> Sejarah Servis</div>
              {[
                { tarikh: '1 Mei 2026', isu: 'Servis tahunan', status: 'Selesai' },
                { tarikh: '15 Jan 2026', isu: 'Pemasangan unit SuHu Pro', status: 'Selesai' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(29,158,117,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{s.isu}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.tarikh}</div>
                  </div>
                  <span style={{ background: 'rgba(29,158,117,0.15)', color: '#4ecca3', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{s.status}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TETAPAN */}
        {activeTab === 'settings' && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Tetapan</div>
                <div className="page-sub">Urus akaun dan notifikasi anda</div>
              </div>
            </div>
            <div className="section-card" style={{ marginBottom: 16 }}>
              <div className="settings-section">
                <div className="settings-title">Maklumat Akaun</div>
                {[
                  { label: 'Nama', sub: 'Ahmad Rizal', type: 'input', val: 'Ahmad Rizal' },
                  { label: 'Emel', sub: 'ahmad@email.com', type: 'input', val: 'ahmad@email.com' },
                  { label: 'Telefon', sub: '012-3456789', type: 'input', val: '012-3456789' },
                ].map((r, i) => (
                  <div key={i} className="settings-row">
                    <div>
                      <div className="settings-label">{r.label}</div>
                    </div>
                    <input className="settings-input" defaultValue={r.val} />
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16 }}>
                  <button className="btn-save">Simpan Perubahan</button>
                </div>
              </div>
            </div>

            <div className="section-card" style={{ marginBottom: 16 }}>
              <div className="settings-section">
                <div className="settings-title">Notifikasi</div>
                {[
                  { label: 'Tangki hampir penuh', sub: 'Notifikasi bila paras air melebihi 90%', on: true },
                  { label: 'Tangki hampir kosong', sub: 'Notifikasi bila paras air kurang dari 20%', on: true },
                  { label: 'WiFi terputus', sub: 'Notifikasi bila unit tidak dalam talian', on: true },
                  { label: 'Ramalan hujan lebat', sub: 'Notifikasi bila hujan lebat dijangka', on: false },
                ].map((r, i) => (
                  <div key={i} className="settings-row">
                    <div>
                      <div className="settings-label">{r.label}</div>
                      <div className="settings-sub">{r.sub}</div>
                    </div>
                    <button className={`toggle${r.on ? '' : ' off'}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="settings-section">
                <div className="settings-title">Keselamatan & Privasi</div>
                <div className="settings-row">
                  <div>
                    <div className="settings-label">Tukar Kata Laluan</div>
                    <div className="settings-sub">Kemas kini kata laluan akaun anda</div>
                  </div>
                  <button className="btn-save">Tukar</button>
                </div>
                <div className="settings-row">
                  <div>
                    <div className="settings-label" style={{ color: '#E24B4A' }}>Padam Akaun</div>
                    <div className="settings-sub">Padam akaun dan semua data anda secara kekal</div>
                  </div>
                  <button className="btn-danger">Padam</button>
                </div>
              </div>
            </div>
          </>
        )}

      </main>

      </div>
    </div>
  )
}