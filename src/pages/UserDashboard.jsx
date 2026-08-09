import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ONLINE_THRESHOLD_MIN = 15 // unit upload setiap 5 min — anggap offline lepas 3 pusingan terlepas

function formatRelativeTime(iso) {
  if (!iso) return 'tiada data'
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return 'baru sahaja'
  if (diffMin < 60) return `${diffMin} minit lalu`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} jam lalu`
  return `${Math.floor(diffHr / 24)} hari lalu`
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
}

const DAY_NAMES = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']

function weatherIcon(code) {
  if (code === 0) return '☀️'
  if (code === 1 || code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code === 45 || code === 48) return '🌫️'
  if (code >= 51 && code <= 57) return '🌦️'
  if (code >= 61 && code <= 82) return '🌧️'
  if (code >= 95) return '⛈️'
  return '⛅'
}

const NAV_MAIN = [
  { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Tangki Saya' },
  { id: 'history', icon: 'ti-history', label: 'Sejarah Data' },
  { id: 'weather', icon: 'ti-cloud', label: 'Cuaca' },
]
const NAV_ACCOUNT = [
  { id: 'equipment', icon: 'ti-tool', label: 'Peralatan & Warranti' },
  { id: 'settings', icon: 'ti-settings', label: 'Tetapan' },
]

export default function UserDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileSidebar, setMobileSidebar] = useState(false)

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [unit, setUnit] = useState(null)
  const [readings, setReadings] = useState([])
  const [weather, setWeather] = useState([])
  const [weatherLoading, setWeatherLoading] = useState(false)

  useEffect(() => {
    let channel

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [{ data: profileData }, { data: unitData }] = await Promise.all([
        supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
        supabase.from('units').select('*').eq('owner_id', user.id).single(),
      ])
      setProfile(profileData)
      setUnit(unitData)

      if (unitData) {
        const { data: readingData } = await supabase
          .from('sensor_data')
          .select('*')
          .eq('unit_id', unitData.id)
          .order('created_at', { ascending: false })
          .limit(50)
        setReadings(readingData || [])

        channel = supabase
          .channel(`sensor_data_${unitData.id}`)
          .on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'sensor_data',
            filter: `unit_id=eq.${unitData.id}`,
          }, (payload) => {
            setReadings(prev => [payload.new, ...prev].slice(0, 50))
          })
          .subscribe()
      }
      setLoading(false)
    }
    load()

    return () => { if (channel) supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (unit?.lokasi_lat == null || unit?.lokasi_lon == null) return
    setWeatherLoading(true)
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${unit.lokasi_lat}&longitude=${unit.lokasi_lon}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia%2FKuala_Lumpur&forecast_days=7`)
      .then(res => res.json())
      .then(data => {
        if (!data.daily) { setWeather([]); return }
        const days = data.daily.time.map((date, i) => ({
          date,
          hari: i === 0 ? 'Hari ini' : i === 1 ? 'Esok' : DAY_NAMES[new Date(date + 'T00:00:00').getDay()],
          icon: weatherIcon(data.daily.weathercode[i]),
          hujanMm: data.daily.precipitation_sum[i],
          suhuMax: Math.round(data.daily.temperature_2m_max[i]),
          suhuMin: Math.round(data.daily.temperature_2m_min[i]),
          code: data.daily.weathercode[i],
        }))
        setWeather(days)
      })
      .catch(() => setWeather([]))
      .finally(() => setWeatherLoading(false))
  }, [unit?.lokasi_lat, unit?.lokasi_lon])

  const latest = readings[0] || null
  const isOnline = latest ? (Date.now() - new Date(latest.created_at).getTime()) / 60000 < ONLINE_THRESHOLD_MIN : false
  const paras = latest && latest.paras_air_pct >= 0 ? Math.round(latest.paras_air_pct) : null
  const parasLiter = latest && latest.paras_air_liter >= 0 ? Math.round(latest.paras_air_liter) : null
  const kapasiti = unit?.kapasiti_liter ?? null
  const hujan = latest ? (latest.hujan_status ? 'Ya' : 'Tidak') : null
  const solar = latest ? latest.solar_volt.toFixed(1) : null
  const bateri = latest && latest.bateri_pct != null ? Math.round(latest.bateri_pct) : null
  // Nama panggilan = nama penuh tanpa bahagian patronimik (bin/binti ...)
  const firstName = profile?.full_name?.split(/\s+bin\s+|\s+binti\s+/i)[0].trim() || 'Pengguna'
  const nameInitial = (profile?.full_name || 'P')[0].toUpperCase()

  // Tank SVG fill — kotak dalam tangki: y 8-94 (tinggi 86)
  const tankFillPct = paras ?? 0
  const tankFillHeight = (tankFillPct / 100) * 86
  const tankFillY = 8 + (86 - tankFillHeight)

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', minHeight: '100vh', width: '100%', background: '#FBF6EE', color: '#1D2420' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; margin: 0; padding: 0; background: #FBF6EE; display: block; text-align: left; border: none; }

        .user-sidebar { width: 230px; min-height: 100vh; background: #12211C; display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .user-main { flex: 1; min-width: 0; padding: 28px 32px 40px; overflow-y: auto; background: #FBF6EE; }

        .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 22px 20px 22px; font-size: 17px; font-weight: 700; color: #fff; cursor: pointer; }
        .sidebar-logo-dot { width: 30px; height: 30px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .sidebar-section { padding: 18px 20px 8px; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.22); letter-spacing: 0.09em; text-transform: uppercase; }
        .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.55); cursor: pointer; margin: 2px 12px; transition: all 0.15s; border: none; background: none; width: calc(100% - 24px); text-align: left; font-family: inherit; }
        .sidebar-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
        .sidebar-item.active { background: #DCF2E7; color: #0F3B2C; font-weight: 600; }
        .sidebar-item i { font-size: 16px; flex-shrink: 0; }
        .sidebar-tip { margin: 16px 16px 4px; background: rgba(255,255,255,0.06); border-radius: 16px; padding: 16px 16px 14px; }
        .sidebar-tip-icon { font-size: 18px; opacity: 0.5; margin-bottom: 8px; }
        .sidebar-tip-text { font-size: 12px; color: rgba(255,255,255,0.72); line-height: 1.55; }
        .sidebar-tip-label { font-size: 10px; color: rgba(255,255,255,0.32); margin-top: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
        .sidebar-bottom { margin-top: auto; padding: 16px 16px 20px; border-top: 1px solid rgba(255,255,255,0.07); }
        .sidebar-user { display: flex; align-items: center; gap: 10px; }
        .sidebar-avatar { width: 34px; height: 34px; border-radius: 50%; background: rgba(29,158,117,0.25); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #6ee0b3; font-weight: 700; flex-shrink: 0; }
        .sidebar-user-name { font-size: 12px; font-weight: 600; color: #fff; }
        .sidebar-user-role { font-size: 10px; color: rgba(255,255,255,0.35); }
        .sidebar-logout { background: none; border: none; color: rgba(255,255,255,0.32); cursor: pointer; font-size: 16px; margin-left: auto; padding: 4px; }
        .sidebar-logout:hover { color: rgba(255,255,255,0.7); }

        /* Mobile nav */
        .mobile-nav { display: none; justify-content: space-between; align-items: center; padding: 14px 20px; background: #12211C; position: sticky; top: 0; z-index: 50; }
        .mobile-logo { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #fff; }
        .hamburger { background: rgba(255,255,255,0.08); border: none; border-radius: 9px; color: #fff; padding: 6px 10px; cursor: pointer; font-size: 16px; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: #12211C; z-index: 100; padding: 20px; flex-direction: column; gap: 4px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu-close { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 22px; cursor: pointer; align-self: flex-end; margin-bottom: 16px; }

        /* Content topbar */
        .content-topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
        .topbar-search { flex: 1; max-width: 320px; display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #F0E9DA; border-radius: 999px; padding: 10px 16px; box-shadow: 0 2px 10px rgba(60,45,20,0.03); }
        .topbar-search i { color: #B4AFA2; font-size: 15px; }
        .topbar-search input { border: none; outline: none; background: none; font-family: inherit; font-size: 13px; color: #1D2420; width: 100%; }
        .topbar-search input::placeholder { color: #B4AFA2; }
        .topbar-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
        .topbar-icon-btn { position: relative; width: 38px; height: 38px; border-radius: 50%; background: #fff; border: 1px solid #F0E9DA; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; color: #6B6355; box-shadow: 0 2px 10px rgba(60,45,20,0.03); }
        .topbar-badge { position: absolute; top: -3px; right: -3px; background: #1D9E75; color: #fff; font-size: 9px; font-weight: 700; border-radius: 999px; padding: 1px 5px; min-width: 15px; text-align: center; border: 2px solid #FBF6EE; }
        .topbar-avatar { width: 38px; height: 38px; border-radius: 50%; background: #DCF2E7; color: #0F3B2C; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }

        .page-header { margin-bottom: 22px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
        .page-title { font-size: 24px; font-weight: 700; color: #171D19; letter-spacing: -0.5px; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #8A8578; }
        .online-badge { display: inline-flex; align-items: center; gap: 6px; background: #DCF2E7; color: #178763; font-size: 12px; font-weight: 600; padding: 7px 15px; border-radius: 999px; }
        .online-dot { width: 7px; height: 7px; border-radius: 50%; background: #178763; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .metrics-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 18px; }
        .metric-card { background: #fff; border-radius: 18px; padding: 18px 18px; box-shadow: 0 2px 14px rgba(60,45,20,0.04); }
        .metric-card.metric-hero { background: linear-gradient(150deg, #16281F, #0E1815); box-shadow: 0 8px 22px rgba(15,30,20,0.25); }
        .metric-icon-chip { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-bottom: 12px; }
        .chip-hero { background: rgba(255,255,255,0.1); color: #6ee0b3; }
        .chip-blue { background: #E1EEFB; color: #2E71C2; }
        .chip-amber { background: #FDF0DC; color: #B87710; }
        .chip-green { background: #DCF2E7; color: #178763; }
        .metric-label { font-size: 11px; color: #8A8578; margin-bottom: 2px; font-weight: 600; }
        .metric-card.metric-hero .metric-label { color: rgba(255,255,255,0.5); }
        .metric-val { font-size: 28px; font-weight: 700; color: #171D19; line-height: 1.2; letter-spacing: -0.5px; }
        .metric-card.metric-hero .metric-val { color: #fff; }
        .metric-unit { font-size: 12px; color: #A6A093; margin-top: 2px; }
        .metric-card.metric-hero .metric-unit { color: rgba(255,255,255,0.4); }
        .metric-sub { font-size: 11px; margin-top: 10px; display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; font-weight: 600; }
        .sub-green { background: #DCF2E7; color: #178763; }
        .sub-amber { background: #FDF0DC; color: #B87710; }
        .metric-card.metric-hero .sub-green { background: rgba(110,224,179,0.18); color: #6ee0b3; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .full-col { margin-bottom: 16px; }

        .section-card { background: #fff; border-radius: 20px; padding: 22px 24px; box-shadow: 0 2px 14px rgba(60,45,20,0.04); }
        .section-title { font-size: 13px; font-weight: 700; color: #171D19; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .section-title i { font-size: 15px; color: #1D9E75; }

        /* Tank SVG */
        .tank-wrap { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        .tank-info { flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .tank-info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F5F0E5; font-size: 13px; }
        .tank-info-row:last-child { border-bottom: none; }
        .tank-info-label { color: #8A8578; }
        .tank-info-val { color: #171D19; font-weight: 600; }

        /* Bar */
        .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .bar-row:last-child { margin-bottom: 0; }
        .bar-label { font-size: 12px; color: #8A8578; width: 54px; flex-shrink: 0; }
        .bar-track { flex: 1; height: 8px; background: #F0EADC; border-radius: 999px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 999px; transition: width 0.5s; }
        .bar-val { font-size: 12px; color: #171D19; font-weight: 600; width: 44px; text-align: right; }

        /* Weather */
        .weather-scroll { display: grid; grid-template-columns: repeat(7,1fr); gap: 8px; }
        .weather-day { background: #FBF8F1; border: 1px solid #F2ECDF; border-radius: 14px; padding: 14px 8px; text-align: center; }
        .weather-day.today { border-color: #B9E4CE; background: #EFF9F4; }
        .weather-day-name { font-size: 10px; color: #A6A093; margin-bottom: 6px; font-weight: 600; }
        .weather-day-icon { font-size: 20px; margin-bottom: 6px; }
        .weather-day-rain { font-size: 11px; color: #2E71C2; font-weight: 700; margin-bottom: 2px; }
        .weather-day-temp { font-size: 10px; color: #A6A093; }

        /* Log table */
        .log-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .log-table th { color: #B4AFA2; font-weight: 600; text-align: left; padding: 6px 10px 10px; border-bottom: 1px solid #F2ECDF; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; }
        .log-table td { padding: 10px; border-bottom: 1px solid #F5F0E5; color: #4A463C; }
        .log-table tr:last-child td { border-bottom: none; }
        .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 5px; }
        .dot-g { background: #1D9E75; }
        .dot-a { background: #EF9F27; }
        .dot-r { background: #D9D2C2; }

        /* Equipment info */
        .equip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .equip-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F5F0E5; font-size: 13px; }
        .equip-row:last-child { border-bottom: none; }
        .equip-label { color: #8A8578; }
        .equip-val { color: #171D19; font-weight: 600; }
        .equip-col { padding: 0 8px; }
        .equip-col:first-child { padding-left: 0; border-right: 1px solid #F2ECDF; }
        .equip-col:last-child { padding-right: 0; }

        /* Tetapan */
        .settings-section { margin-bottom: 24px; }
        .settings-title { font-size: 12px; font-weight: 700; color: #A6A093; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 12px; }
        .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #F5F0E5; }
        .settings-row:last-child { border-bottom: none; }
        .settings-label { font-size: 14px; color: #171D19; font-weight: 600; }
        .settings-sub { font-size: 12px; color: #A6A093; margin-top: 2px; }
        .toggle { width: 42px; height: 24px; border-radius: 999px; background: #1D9E75; border: none; cursor: pointer; position: relative; flex-shrink: 0; }
        .toggle::after { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #fff; top: 3px; right: 3px; }
        .toggle.off { background: #E3DCC9; }
        .toggle.off::after { right: auto; left: 3px; }
        .settings-input { background: #FBF8F1; border: 1px solid #F0E9DA; border-radius: 9px; color: #171D19; font-size: 13px; padding: 9px 12px; font-family: inherit; outline: none; width: 180px; }
        .settings-input:focus { border-color: #1D9E75; }
        .btn-save { background: #1D9E75; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-save:hover { background: #178763; }
        .btn-danger { background: #FBE7E6; color: #C23A39; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-danger:hover { background: #F8D8D6; }

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
          .content-topbar { flex-wrap: wrap; }
          .topbar-search { max-width: none; order: 2; flex-basis: 100%; }
        }
        @media (max-width: 480px) {
          .metrics-grid { grid-template-columns: repeat(2,1fr); }
          .weather-scroll { grid-template-columns: repeat(4,1fr); }
        }
      `}</style>

      {/* ── SIDEBAR (DESKTOP) ── */}
      <aside className="user-sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')}>
          <div className="sidebar-logo-dot">💧</div>
          SuHu
        </div>
        <div className="sidebar-section">Dashboard</div>
        {NAV_MAIN.map(item => (
          <button key={item.id} className={`sidebar-item${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}
        <div className="sidebar-section">Akaun</div>
        {NAV_ACCOUNT.map(item => (
          <button key={item.id} className={`sidebar-item${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}

        <div className="sidebar-tip">
          <div className="sidebar-tip-icon">☔</div>
          <div className="sidebar-tip-text">Hujan lebat dijangka esok — tangki anda akan penuh lebih cepat, semak paras air kerap.</div>
          <div className="sidebar-tip-label">Tip Cuaca</div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{nameInitial}</div>
            <div>
              <div className="sidebar-user-name">{profile?.full_name || 'Pengguna'}</div>
              <div className="sidebar-user-role">Pengguna</div>
            </div>
            <button className="sidebar-logout" onClick={() => navigate('/login')}>
              <i className="ti ti-logout" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

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
          {NAV_MAIN.concat(NAV_ACCOUNT).map(item => (
            <button key={item.id} className={`sidebar-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => { setActiveTab(item.id); setMobileSidebar(false) }}>
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              {item.label}
            </button>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button className="sidebar-item" onClick={() => navigate('/login')}>
              <i className="ti ti-logout" aria-hidden="true" /> Log Keluar
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="user-main">

        <div className="content-topbar">
          <div className="topbar-search">
            <i className="ti ti-search" aria-hidden="true" />
            <input placeholder="Cari dalam log data..." />
          </div>
          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Notifikasi">
              <i className="ti ti-bell" aria-hidden="true" />
              <span className="topbar-badge">1</span>
            </button>
            <div className="topbar-avatar">{nameInitial}</div>
          </div>
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Selamat kembali, {firstName} 👋</div>
                <div className="page-sub">
                  {unit?.lokasi_alamat || 'Lokasi belum didaftarkan'} · Kemaskini {formatRelativeTime(latest?.created_at)}
                </div>
              </div>
              <div className="online-badge" style={!isOnline ? { background: '#F0EADC', color: '#8A8578' } : undefined}>
                <div className="online-dot" style={!isOnline ? { background: '#8A8578', animation: 'none' } : undefined} />
                {isOnline ? 'Dalam Talian' : 'Luar Talian'}
              </div>
            </div>

            {loading && <div className="section-card" style={{ marginBottom: 16 }}>Memuatkan data...</div>}
            {!loading && !unit && (
              <div className="section-card" style={{ marginBottom: 16 }}>
                Tiada unit SuHu didaftarkan untuk akaun anda lagi. Hubungi admin untuk pendaftaran unit.
              </div>
            )}
            {!loading && unit && readings.length === 0 && (
              <div className="section-card" style={{ marginBottom: 16 }}>
                Unit anda dah berdaftar tapi belum ada bacaan sensor diterima lagi. Pastikan unit online dan disambung ke WiFi.
              </div>
            )}

            {/* Metrics */}
            <div className="metrics-grid">
              <div className="metric-card metric-hero">
                <div className="metric-icon-chip chip-hero"><i className="ti ti-ripple" aria-hidden="true" /></div>
                <div className="metric-label">Paras Air</div>
                <div className="metric-val">{paras !== null ? paras : '–'}</div>
                <div className="metric-unit">{paras !== null ? '% penuh' : 'sensor gagal baca'}</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon-chip chip-blue"><i className="ti ti-cloud-rain" aria-hidden="true" /></div>
                <div className="metric-label">Hujan</div>
                <div className="metric-val" style={{ fontSize: 22 }}>{hujan ?? '–'}</div>
                <div className="metric-unit">{latest ? 'bacaan terkini' : 'tiada data'}</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon-chip chip-amber"><i className="ti ti-solar-panel" aria-hidden="true" /></div>
                <div className="metric-label">Solar</div>
                <div className="metric-val">{solar ?? '–'}</div>
                <div className="metric-unit">V output</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon-chip chip-green"><i className="ti ti-battery-charging" aria-hidden="true" /></div>
                <div className="metric-label">Bateri</div>
                <div className="metric-val">{bateri !== null ? bateri : '–'}</div>
                <div className="metric-unit">% caj</div>
              </div>
            </div>

            <div className="two-col">
              {/* Tank visual */}
              <div className="section-card">
                <div className="section-title"><i className="ti ti-container" aria-hidden="true" /> Status Tangki</div>
                <div className="tank-wrap">
                  <svg width="64" height="110" viewBox="0 0 64 110" aria-label={paras !== null ? `Tangki ${paras}% penuh` : 'Tangki tiada bacaan'}>
                    <rect x="8" y="6" width="48" height="90" rx="6" fill="none" stroke="#E3DAC4" strokeWidth="1.5"/>
                    <rect x="10" y="8" width="44" height="86" rx="4" fill="#FBF8F1"/>
                    {paras !== null && <rect x="10" y={tankFillY} width="44" height={tankFillHeight} rx="0" fill="#1D9E75" fillOpacity="0.35"/>}
                    <rect x="24" y="96" width="16" height="8" rx="3" fill="#E3DAC4"/>
                    <text x="32" y="64" textAnchor="middle" fontSize="13" fontWeight="700" fill="#178763">{paras !== null ? `${paras}%` : '–'}</text>
                  </svg>
                  <div className="tank-info">
                    <div className="tank-info-row"><span className="tank-info-label">Isipadu</span><span className="tank-info-val">{parasLiter !== null ? `${parasLiter.toLocaleString('ms-MY')} L` : '–'}</span></div>
                    <div className="tank-info-row"><span className="tank-info-label">Kapasiti</span><span className="tank-info-val">{kapasiti ? `${kapasiti.toLocaleString('ms-MY')} L` : '–'}</span></div>
                    <div className="tank-info-row"><span className="tank-info-label">Wifi Unit</span><span className="tank-info-val">{latest ? (latest.is_wifi_connected ? 'Bersambung' : 'Terputus') : '–'}</span></div>
                  </div>
                </div>
                <div>
                  <div className="bar-row">
                    <span className="bar-label">Solar</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: latest ? `${Math.min(latest.solar_volt / 25 * 100, 100)}%` : '0%', background: '#EF9F27' }} /></div>
                    <span className="bar-val">{solar !== null ? `${solar}V` : '–'}</span>
                  </div>
                  <div className="bar-row">
                    <span className="bar-label">Bateri</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: (bateri ?? 0) + '%', background: '#1D9E75' }} /></div>
                    <span className="bar-val">{bateri !== null ? `${bateri}%` : '–'}</span>
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
                    {readings.length === 0 && (
                      <tr><td colSpan={5} style={{ color: '#A6A093', textAlign: 'center', padding: '20px 0' }}>Tiada bacaan lagi</td></tr>
                    )}
                    {readings.slice(0, 8).map((l) => (
                      <tr key={l.id}>
                        <td style={{ color: '#A6A093', fontFamily: 'monospace' }}>{formatTime(l.created_at)}</td>
                        <td>{l.paras_air_pct >= 0 ? `${Math.round(l.paras_air_pct)}%` : '–'}</td>
                        <td>
                          <span className={`dot ${l.hujan_status ? 'dot-g' : 'dot-r'}`} />
                          {l.hujan_status ? 'Ya' : 'Tidak'}
                        </td>
                        <td>{l.solar_volt.toFixed(1)}V</td>
                        <td>{l.bateri_pct != null ? `${Math.round(l.bateri_pct)}%` : '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weather */}
            <div className="section-card">
              <div className="section-title"><i className="ti ti-cloud" aria-hidden="true" /> Ramalan Cuaca 7 Hari{unit?.lokasi_alamat ? ` — ${unit.lokasi_alamat}` : ''}</div>
              {weatherLoading && <div style={{ color: '#A6A093', fontSize: 13 }}>Memuatkan ramalan cuaca...</div>}
              {!weatherLoading && weather.length === 0 && (
                <div style={{ color: '#A6A093', fontSize: 13 }}>Tiada koordinat lokasi untuk unit ini — ramalan cuaca tidak tersedia.</div>
              )}
              {!weatherLoading && weather.length > 0 && (
                <div className="weather-scroll">
                  {weather.map((w, i) => (
                    <div key={w.date} className={`weather-day${i === 0 ? ' today' : ''}`}>
                      <div className="weather-day-name">{w.hari}</div>
                      <div className="weather-day-icon">{w.icon}</div>
                      <div className="weather-day-rain">{Math.round(w.hujanMm)}mm</div>
                      <div className="weather-day-temp">{w.suhuMax}°C</div>
                    </div>
                  ))}
                </div>
              )}
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
              <div className="section-title"><i className="ti ti-table" aria-hidden="true" /> Log Sensor — {readings.length} bacaan terkini</div>
              <table className="log-table">
                <thead>
                  <tr><th>Masa</th><th>Paras Air</th><th>Hujan</th><th>Solar</th><th>Bateri</th></tr>
                </thead>
                <tbody>
                  {readings.length === 0 && (
                    <tr><td colSpan={5} style={{ color: '#A6A093', textAlign: 'center', padding: '20px 0' }}>Tiada bacaan lagi</td></tr>
                  )}
                  {readings.map((l) => (
                    <tr key={l.id}>
                      <td style={{ color: '#A6A093', fontFamily: 'monospace' }}>{new Date(l.created_at).toLocaleString('ms-MY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        {l.paras_air_pct >= 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 60, height: 5, background: '#F0EADC', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: l.paras_air_pct + '%', background: '#1D9E75', borderRadius: 999 }} />
                            </div>
                            {Math.round(l.paras_air_pct)}%
                          </div>
                        ) : '– gagal baca'}
                      </td>
                      <td><span className={`dot ${l.hujan_status ? 'dot-g' : 'dot-r'}`} />{l.hujan_status ? 'Ya' : 'Tidak'}</td>
                      <td>{l.solar_volt.toFixed(1)}V</td>
                      <td>{l.bateri_pct != null ? `${Math.round(l.bateri_pct)}%` : '–'}</td>
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
                <div className="page-sub">{unit?.lokasi_alamat || 'Lokasi belum didaftarkan'} · Open-Meteo API</div>
              </div>
            </div>
            <div className="section-card" style={{ marginBottom: 16 }}>
              <div className="section-title"><i className="ti ti-cloud" aria-hidden="true" /> 7 Hari ke Hadapan</div>
              {weatherLoading && <div style={{ color: '#A6A093', fontSize: 13 }}>Memuatkan ramalan cuaca...</div>}
              {!weatherLoading && weather.length === 0 && (
                <div style={{ color: '#A6A093', fontSize: 13 }}>Tiada koordinat lokasi untuk unit ini — ramalan cuaca tidak tersedia. Hubungi admin untuk kemas kini lokasi.</div>
              )}
              {!weatherLoading && weather.length > 0 && (
                <div className="weather-scroll">
                  {weather.map((w, i) => (
                    <div key={w.date} className={`weather-day${i === 0 ? ' today' : ''}`}>
                      <div className="weather-day-name">{w.hari}</div>
                      <div className="weather-day-icon">{w.icon}</div>
                      <div className="weather-day-rain">{Math.round(w.hujanMm)}mm</div>
                      <div className="weather-day-temp">{w.suhuMax}°/{w.suhuMin}°C</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {weather.length > 0 && (
              <div className="two-col">
                <div className="section-card">
                  <div className="section-title"><i className="ti ti-droplet" aria-hidden="true" /> Jumlah Hujan Minggu Ini</div>
                  <div style={{ fontSize: 40, fontWeight: 700, color: '#2E71C2', letterSpacing: -1 }}>
                    {Math.round(weather.reduce((s, w) => s + w.hujanMm, 0))}mm
                  </div>
                  <div style={{ fontSize: 13, color: '#8A8578', marginTop: 6 }}>Jumlah dijangka bagi 7 hari akan datang</div>
                </div>
                <div className="section-card">
                  <div className="section-title"><i className="ti ti-sun" aria-hidden="true" /> Hari Cerah Minggu Ini</div>
                  <div style={{ fontSize: 40, fontWeight: 700, color: '#B87710', letterSpacing: -1 }}>
                    {weather.filter(w => w.code === 0 || w.code === 1).length} hari
                  </div>
                  <div style={{ fontSize: 13, color: '#8A8578', marginTop: 6 }}>
                    {weather.filter(w => w.code === 0 || w.code === 1).map(w => w.hari).join(', ') || 'Tiada hari cerah dijangka'}
                  </div>
                </div>
              </div>
            )}
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
                    { label: 'Tamat Warranti', val: 'Jan 2028', color: '#178763' },
                    { label: 'Dashboard', val: 'Aktif (hingga Jan 2027)', color: '#178763' },
                    { label: 'Servis Terakhir', val: '1 Mei 2026' },
                    { label: 'Servis Seterusnya', val: 'Jan 2027', color: '#B87710' },
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
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 1 ? '1px solid #F5F0E5' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: '#DCF2E7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#171D19', marginBottom: 3 }}>{s.isu}</div>
                    <div style={{ fontSize: 11, color: '#A6A093' }}>{s.tarikh}</div>
                  </div>
                  <span style={{ background: '#DCF2E7', color: '#178763', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{s.status}</span>
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
                    <div className="settings-label" style={{ color: '#C23A39' }}>Padam Akaun</div>
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
  )
}
