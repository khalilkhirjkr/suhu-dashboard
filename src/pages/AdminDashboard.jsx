import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabase'
import LocationPicker from '../components/LocationPicker'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const UNITS = [
  { id: 1, owner: 'Ahmad Rizal', phone: '012-3456789', lokasi: 'Ampang, Selangor', lat: 3.1478, lng: 101.7620, paras: 82, status: 'aktif', solar: 18.4, bateri: 76, warranti: 'Jan 2028', dashboard: 'aktif', servis: '1 Mei 2026', model: 'SuHu Pro', siri: 'SH-2026-0042' },
  { id: 2, owner: 'Siti Mariam', phone: '011-2345678', lokasi: 'Cheras, KL', lat: 3.1073, lng: 101.7420, paras: 65, status: 'aktif', solar: 17.2, bateri: 60, warranti: 'Mac 2027', dashboard: 'aktif', servis: '10 Apr 2026', model: 'SuHu Starter', siri: 'SH-2026-0018' },
  { id: 3, owner: 'Hafiz Zaki', phone: '013-3456789', lokasi: 'Puchong, Selangor', lat: 3.0219, lng: 101.6172, paras: 40, status: 'selenggara', solar: 0, bateri: 20, warranti: 'Nov 2027', dashboard: 'aktif', servis: '3 Jun 2026', model: 'SuHu Pro', siri: 'SH-2026-0031' },
  { id: 4, owner: 'Nurul Huda', phone: '019-4567890', lokasi: 'Kajang, Selangor', lat: 2.9931, lng: 101.7874, paras: 91, status: 'aktif', solar: 19.1, bateri: 88, warranti: 'Feb 2028', dashboard: 'aktif', servis: '20 Mar 2026', model: 'SuHu Pro', siri: 'SH-2026-0055' },
  { id: 5, owner: 'Zulkifli Md', phone: '017-5678901', lokasi: 'Semenyih, Selangor', lat: 2.9486, lng: 101.8471, paras: 55, status: 'aktif', solar: 15.8, bateri: 50, warranti: 'Jul 2026', dashboard: 'hampir tamat', servis: '15 Feb 2026', model: 'SuHu Starter', siri: 'SH-2025-0009' },
  { id: 6, owner: 'Faizal Harun', phone: '016-6789012', lokasi: 'Rawang, Selangor', lat: 3.3251, lng: 101.5766, paras: 73, status: 'aktif', solar: 16.5, bateri: 65, warranti: 'Sep 2027', dashboard: 'aktif', servis: '5 Apr 2026', model: 'SuHu Starter', siri: 'SH-2026-0022' },
]

const MAINTENANCE = [
  { owner: 'Hafiz Zaki', lokasi: 'Puchong', isu: 'Sensor ultrasonic diganti', tarikh: '3 Jun 2026', status: 'selenggara' },
  { owner: 'Ahmad Rizal', lokasi: 'Ampang', isu: 'Servis tahunan selesai', tarikh: '1 Mei 2026', status: 'selesai' },
  { owner: 'Zulkifli Md', lokasi: 'Semenyih', isu: 'Warranti tamat 15 Jul 2026', tarikh: '15 Jul 2026', status: 'segera' },
  { owner: 'Siti Mariam', lokasi: 'Cheras', isu: 'Bateri diganti', tarikh: '10 Apr 2026', status: 'selesai' },
]

function emptyAddUnitForm() {
  return { ownerId: '', serialNumber: '', model: 'SuHu Starter', kapasitiLiter: 630, tarikhPasang: '', tarikhWarranti: '', lokasiAlamat: '', lat: null, lon: null }
}

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
  const [search, setSearch] = useState('')

  const [showAddUnit, setShowAddUnit] = useState(false)
  const [userProfiles, setUserProfiles] = useState([])
  const [addUnitForm, setAddUnitForm] = useState(emptyAddUnitForm())
  const [addUnitError, setAddUnitError] = useState('')
  const [addUnitSaving, setAddUnitSaving] = useState(false)
  const [addUnitSuccess, setAddUnitSuccess] = useState('')

  useEffect(() => {
    if (!showAddUnit) return
    Promise.all([
      supabase.from('profiles').select('id, full_name, email').eq('role', 'user').order('full_name'),
      supabase.from('units').select('owner_id'),
    ]).then(([{ data: profiles }, { data: existingUnits }]) => {
      const ownedIds = new Set((existingUnits || []).map(u => u.owner_id))
      setUserProfiles((profiles || []).filter(p => !ownedIds.has(p.id)))
    })
  }, [showAddUnit])

  const openAddUnit = () => {
    setAddUnitForm(emptyAddUnitForm())
    setAddUnitError('')
    setAddUnitSuccess('')
    setShowAddUnit(true)
  }

  const submitAddUnit = async (e) => {
    e.preventDefault()
    const f = addUnitForm
    if (!f.ownerId) { setAddUnitError('Sila pilih owner unit.'); return }
    if (!f.serialNumber.trim()) { setAddUnitError('Sila isi nombor siri unit.'); return }
    if (f.lat == null || f.lon == null) { setAddUnitError('Sila tetapkan lokasi unit pada peta.'); return }

    setAddUnitSaving(true)
    setAddUnitError('')
    const { error } = await supabase.from('units').insert({
      id: f.ownerId,
      owner_id: f.ownerId,
      serial_number: f.serialNumber.trim(),
      model: f.model,
      lokasi_alamat: f.lokasiAlamat.trim() || null,
      lokasi_lat: f.lat,
      lokasi_lon: f.lon,
      kapasiti_liter: Number(f.kapasitiLiter) || 630,
      tarikh_pasang: f.tarikhPasang || null,
      tarikh_warranti: f.tarikhWarranti || null,
    })
    setAddUnitSaving(false)

    if (error) { setAddUnitError('Gagal simpan unit: ' + error.message); return }
    setAddUnitSuccess(`Unit ${f.serialNumber} berjaya didaftarkan.`)
    setAddUnitForm(emptyAddUnitForm())
  }

  const stats = {
    total: UNITS.length,
    aktif: UNITS.filter(u => u.status === 'aktif').length,
    selenggara: UNITS.filter(u => u.status === 'selenggara').length,
    warrantiExpiring: UNITS.filter(u => u.warranti === 'hampir tamat' || u.dashboard === 'hampir tamat').length,
  }

  const filteredUnits = UNITS.filter(u => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return u.owner.toLowerCase().includes(q) || u.lokasi.toLowerCase().includes(q) || u.model.toLowerCase().includes(q)
  })

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
      aktif: { bg: '#DCF2E7', color: '#178763', text: 'Aktif' },
      selenggara: { bg: '#FDF0DC', color: '#B87710', text: 'Selenggara' },
      segera: { bg: '#FBE0DF', color: '#C23A39', text: 'Segera' },
      selesai: { bg: '#DCF2E7', color: '#178763', text: 'Selesai' },
      'hampir tamat': { bg: '#FDF0DC', color: '#B87710', text: 'Hampir Tamat' },
    }
    const s = map[status] || map.aktif
    return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>{s.text}</span>
  }

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', background: '#FBF6EE', color: '#1D2420' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; margin: 0; padding: 0; background: #FBF6EE; display: block; text-align: left; border: none; }

        /* Layout */
        .admin-layout { display: flex; flex: 1; min-height: 100vh; }
        .admin-sidebar { width: 230px; min-height: 100vh; background: #12211C; display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .admin-main { flex: 1; min-width: 0; padding: 28px 32px 40px; background: #FBF6EE; }

        /* Sidebar styles */
        .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 22px 20px 22px; font-size: 17px; font-weight: 700; color: #fff; cursor: pointer; }
        .sidebar-logo-dot { width: 30px; height: 30px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .sidebar-badge { font-size: 9px; background: rgba(29,158,117,0.25); color: #6ee0b3; padding: 2px 7px; border-radius: 999px; margin-left: auto; font-weight: 700; letter-spacing: 0.04em; }
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
        .sidebar-logout { background: none; border: none; color: rgba(255,255,255,0.32); cursor: pointer; font-size: 18px; margin-left: auto; padding: 4px; transition: color 0.15s; line-height: 1; }
        .sidebar-logout:hover { color: #f87171; }

        /* Mobile topbar */
        .mobile-topbar { display: none; justify-content: space-between; align-items: center; padding: 14px 20px; background: #12211C; position: sticky; top: 0; z-index: 40; }
        .mobile-logo { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #fff; }
        .mobile-logo-dot { width: 26px; height: 26px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .mobile-right { display: flex; align-items: center; gap: 8px; }
        .mobile-badge { font-size: 9px; background: rgba(29,158,117,0.25); color: #6ee0b3; padding: 2px 7px; border-radius: 999px; font-weight: 700; }
        .mobile-hamburger { background: rgba(255,255,255,0.08); border: none; border-radius: 9px; color: #fff; padding: 7px 10px; cursor: pointer; font-size: 16px; line-height: 1; }

        /* Mobile menu overlay */
        .mobile-menu-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 45; }
        .mobile-menu-overlay.open { display: block; }
        .mobile-menu { position: fixed; top: 0; left: 0; bottom: 0; width: 270px; background: #12211C; z-index: 50; display: flex; flex-direction: column; transform: translateX(-100%); transition: transform 0.25s; }
        .mobile-menu.open { transform: translateX(0); }
        .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .mobile-menu-logo { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #fff; }
        .mobile-menu-close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 20px; padding: 4px; line-height: 1; }
        .mobile-menu-close:hover { color: #fff; }
        .mobile-menu-body { flex: 1; overflow-y: auto; padding: 8px 0; }
        .mobile-menu-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.07); }
        .mobile-user { display: flex; align-items: center; gap: 10px; }
        .mobile-logout { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; background: rgba(226,75,74,0.12); border: 1px solid rgba(226,75,74,0.2); color: #f87171; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 12px; }
        .mobile-logout:hover { background: rgba(226,75,74,0.2); }

        /* Content topbar */
        .content-topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .topbar-search { flex: 1; max-width: 340px; display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #F0E9DA; border-radius: 999px; padding: 10px 16px; box-shadow: 0 2px 10px rgba(60,45,20,0.03); }
        .topbar-search i { color: #B4AFA2; font-size: 15px; }
        .topbar-search input { border: none; outline: none; background: none; font-family: inherit; font-size: 13px; color: #1D2420; width: 100%; }
        .topbar-search input::placeholder { color: #B4AFA2; }
        .topbar-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
        .topbar-icon-btn { position: relative; width: 38px; height: 38px; border-radius: 50%; background: #fff; border: 1px solid #F0E9DA; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; color: #6B6355; box-shadow: 0 2px 10px rgba(60,45,20,0.03); }
        .topbar-badge { position: absolute; top: -3px; right: -3px; background: #E24B4A; color: #fff; font-size: 9px; font-weight: 700; border-radius: 999px; padding: 1px 5px; min-width: 15px; text-align: center; border: 2px solid #FBF6EE; }
        .topbar-avatar { width: 38px; height: 38px; border-radius: 50%; background: #DCF2E7; color: #0F3B2C; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }

        /* Content */
        .page-header { margin-bottom: 24px; }
        .page-title { font-size: 24px; font-weight: 700; color: #171D19; letter-spacing: -0.5px; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #8A8578; }

        .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
        .stat-box { background: #fff; border-radius: 18px; padding: 20px 20px; box-shadow: 0 2px 14px rgba(60,45,20,0.04); }
        .stat-box.stat-hero { background: linear-gradient(150deg, #16281F, #0E1815); box-shadow: 0 8px 22px rgba(15,30,20,0.25); }
        .stat-icon-chip { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 17px; margin-bottom: 14px; }
        .chip-hero { background: rgba(255,255,255,0.1); color: #6ee0b3; }
        .chip-green { background: #DCF2E7; color: #178763; }
        .chip-amber { background: #FDF0DC; color: #B87710; }
        .chip-red { background: #FBE0DF; color: #C23A39; }
        .stat-box-val { font-size: 28px; font-weight: 700; color: #171D19; letter-spacing: -0.5px; margin-bottom: 4px; }
        .stat-box.stat-hero .stat-box-val { color: #fff; }
        .stat-box-label { font-size: 12px; color: #8A8578; }
        .stat-box.stat-hero .stat-box-label { color: rgba(255,255,255,0.5); }

        .section-card { background: #fff; border-radius: 20px; padding: 22px 24px; margin-bottom: 16px; box-shadow: 0 2px 14px rgba(60,45,20,0.04); overflow-x: auto; }
        .section-title { font-size: 14px; font-weight: 700; color: #171D19; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .section-title i { font-size: 16px; color: #1D9E75; }

        .unit-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .unit-table th { color: #B4AFA2; font-weight: 600; text-align: left; padding: 8px 12px; border-bottom: 1px solid #F2ECDF; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; }
        .unit-table td { padding: 13px 12px; border-bottom: 1px solid #F5F0E5; color: #4A463C; vertical-align: middle; }
        .unit-table tr:last-child td { border-bottom: none; }
        .unit-table tr:hover td { background: #FBF8F1; cursor: pointer; }
        .unit-table tr.selected td { background: #EFF9F4; }

        .progress-bar { height: 6px; background: #F0EADC; border-radius: 999px; overflow: hidden; width: 80px; display: inline-block; vertical-align: middle; margin-right: 6px; }
        .progress-fill { height: 100%; border-radius: 999px; }

        .maint-item { display: flex; align-items: center; gap: 12px; padding: 13px 0; border-bottom: 1px solid #F5F0E5; }
        .maint-item:last-child { border-bottom: none; }
        .maint-icon { width: 36px; height: 36px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .maint-title { font-size: 13px; font-weight: 600; color: #171D19; margin-bottom: 3px; }
        .maint-sub { font-size: 11px; color: #A6A093; }

        .map-box { height: 420px; border-radius: 16px; overflow: hidden; position: sticky; top: 20px; z-index: 1; }

        /* Detail panel */
        .detail-panel { background: #fff; border-left: 1px solid #F0E9DA; width: 320px; padding: 24px 22px; position: fixed; right: 0; top: 0; bottom: 0; overflow-y: auto; z-index: 50; transform: translateX(100%); transition: transform 0.25s; box-shadow: -8px 0 30px rgba(60,45,20,0.08); }
        .detail-panel.open { transform: translateX(0); }
        .detail-close { background: #F5F0E5; border: none; color: #8A8578; cursor: pointer; font-size: 16px; padding: 6px 8px; border-radius: 8px; float: right; }
        .detail-close:hover { background: #EDE6D6; color: #4A463C; }
        .detail-title { font-size: 17px; font-weight: 700; color: #171D19; margin-bottom: 4px; margin-top: 10px; }
        .detail-sub { font-size: 12px; color: #A6A093; margin-bottom: 20px; }
        .detail-section { margin-bottom: 18px; }
        .detail-section-title { font-size: 10px; font-weight: 700; color: #C7BFA9; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F5F0E5; font-size: 12px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #A6A093; }
        .detail-val { color: #171D19; font-weight: 600; }
        .detail-metric { background: #FBF8F1; border-radius: 12px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .detail-metric-val { font-size: 20px; font-weight: 700; color: #171D19; }
        .detail-metric-label { font-size: 11px; color: #A6A093; margin-top: 2px; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(20,25,20,0.45); z-index: 60; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-card { background: #fff; border-radius: 20px; padding: 26px 28px; width: 100%; min-width: 0; max-width: 480px; max-height: 90vh; overflow-y: auto; overflow-x: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.2); box-sizing: border-box; }
        .modal-title { font-size: 18px; font-weight: 700; color: #171D19; margin-bottom: 18px; }
        .form-row { margin-bottom: 14px; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-label { display: block; font-size: 12px; font-weight: 600; color: #8A8578; margin-bottom: 6px; }
        .form-input, .form-select { width: 100%; background: #FBF8F1; border: 1px solid #F0E9DA; border-radius: 9px; color: #171D19; font-size: 13px; padding: 9px 12px; font-family: inherit; outline: none; }
        .form-input:focus, .form-select:focus { border-color: #1D9E75; }
        .form-error { color: #C23A39; font-size: 12px; margin-top: 4px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .btn-primary { background: #1D9E75; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-primary:hover { background: #178763; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { background: #F5F0E5; color: #4A463C; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-secondary:hover { background: #EDE6D6; }
        .btn-add-unit { background: #1D9E75; color: #fff; border: none; border-radius: 10px; padding: 10px 18px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 6px; }
        .btn-add-unit:hover { background: #178763; }

        /* Responsive */
        @media (max-width: 900px) {
          .admin-sidebar { display: none; }
          .mobile-topbar { display: flex; }
          .admin-main { padding: 20px 16px; }
          .stats-row { grid-template-columns: repeat(2,1fr); }
          .two-col { grid-template-columns: 1fr; }
          .detail-panel { width: 100%; }
          .content-topbar { flex-wrap: wrap; }
          .topbar-search { max-width: none; order: 2; flex-basis: 100%; }
          .form-row-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .modal-overlay { padding: 12px; }
          .modal-card { padding: 20px 16px; }
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

          <div className="sidebar-tip">
            <div className="sidebar-tip-icon">💧</div>
            <div className="sidebar-tip-text">Semak paras tangki unit "hampir tamat warranti" sebelum musim kemarau tiba.</div>
            <div className="sidebar-tip-label">Tip Penyelenggaraan</div>
          </div>

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

          <div className="content-topbar">
            <div className="topbar-search">
              <i className="ti ti-search" aria-hidden="true" />
              <input placeholder="Cari owner, lokasi atau model..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="topbar-actions">
              <button className="topbar-icon-btn" title="Notifikasi">
                <i className="ti ti-bell" aria-hidden="true" />
                {(stats.selenggara + stats.warrantiExpiring) > 0 && <span className="topbar-badge">{stats.selenggara + stats.warrantiExpiring}</span>}
              </button>
              <div className="topbar-avatar">K</div>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="page-header">
                <div className="page-title">Selamat kembali, Khalil 👋</div>
                <div className="page-sub">Kemaskini terakhir: 10 Jun 2026, 14:32</div>
              </div>
              <div className="stats-row">
                <div className="stat-box stat-hero">
                  <div className="stat-icon-chip chip-hero"><i className="ti ti-database" aria-hidden="true" /></div>
                  <div className="stat-box-val">{stats.total}</div>
                  <div className="stat-box-label">Jumlah unit berdaftar</div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon-chip chip-green"><i className="ti ti-circle-check" aria-hidden="true" /></div>
                  <div className="stat-box-val" style={{ color: '#178763' }}>{stats.aktif}</div>
                  <div className="stat-box-label">Unit aktif</div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon-chip chip-amber"><i className="ti ti-tool" aria-hidden="true" /></div>
                  <div className="stat-box-val" style={{ color: '#B87710' }}>{stats.selenggara}</div>
                  <div className="stat-box-label">Perlu penyelenggaraan</div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon-chip chip-red"><i className="ti ti-certificate" aria-hidden="true" /></div>
                  <div className="stat-box-val" style={{ color: '#C23A39' }}>{stats.warrantiExpiring}</div>
                  <div className="stat-box-label">Warranti hampir tamat</div>
                </div>
              </div>
              <div className="two-col">
                <div className="section-card">
                  <div className="section-title"><i className="ti ti-list" aria-hidden="true" /> Unit Terkini</div>
                  <table className="unit-table">
                    <thead><tr><th>Owner</th><th>Lokasi</th><th>Status</th></tr></thead>
                    <tbody>
                      {filteredUnits.slice(0, 5).map(u => (
                        <tr key={u.id} onClick={() => { setSelectedUnit(u); setDetailOpen(true) }}>
                          <td style={{ fontWeight: 600, color: '#171D19' }}>{u.owner}</td>
                          <td style={{ color: '#8A8578' }}>{u.lokasi}</td>
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
                      <div className="maint-icon" style={{ background: m.status === 'selesai' ? '#DCF2E7' : m.status === 'segera' ? '#FBE0DF' : '#FDF0DC', color: m.status === 'selesai' ? '#178763' : m.status === 'segera' ? '#C23A39' : '#B87710' }}>
                        <i className={`ti ${m.status === 'selesai' ? 'ti-check' : m.status === 'segera' ? 'ti-alert-triangle' : 'ti-settings'}`} aria-hidden="true" />
                      </div>
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
                <div>
                  <div className="page-title">Semua Unit Berdaftar</div>
                  <div className="page-sub">{filteredUnits.length} daripada {UNITS.length} unit · Klik baris untuk lihat detail</div>
                </div>
                <button className="btn-add-unit" onClick={openAddUnit}>
                  <i className="ti ti-plus" aria-hidden="true" /> Tambah Unit
                </button>
              </div>
              <div className="section-card">
                <table className="unit-table">
                  <thead>
                    <tr><th>Owner</th><th>Telefon</th><th>Lokasi</th><th>Model</th><th>Paras Air</th><th>Solar</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {filteredUnits.map(u => (
                      <tr key={u.id} className={selectedUnit?.id === u.id ? 'selected' : ''} onClick={() => { setSelectedUnit(u); setDetailOpen(true) }}>
                        <td style={{ fontWeight: 600, color: '#171D19' }}>{u.owner}</td>
                        <td style={{ color: '#8A8578' }}>{u.phone}</td>
                        <td style={{ color: '#8A8578' }}>{u.lokasi}</td>
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
                  <MapContainer center={[3.05, 101.68]} zoom={10} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: 16 }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {UNITS.map(u => (
                      <Marker key={u.id} position={[u.lat, u.lng]}>
                        <Popup>
                          <strong>{u.owner}</strong><br />
                          {u.lokasi}<br />
                          Paras Air: {u.paras}%
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
                <div style={{ marginTop: 16 }}>
                  <table className="unit-table">
                    <thead><tr><th>Owner</th><th>Lokasi</th><th>Paras Air</th><th>Status</th></tr></thead>
                    <tbody>
                      {UNITS.map(u => (
                        <tr key={u.id} onClick={() => { setSelectedUnit(u); setDetailOpen(true) }}>
                          <td style={{ fontWeight: 600, color: '#171D19' }}>{u.owner}</td>
                          <td style={{ color: '#8A8578' }}>{u.lokasi}</td>
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
                    <div className="maint-icon" style={{ background: m.status === 'selesai' ? '#DCF2E7' : m.status === 'segera' ? '#FBE0DF' : '#FDF0DC', color: m.status === 'selesai' ? '#178763' : m.status === 'segera' ? '#C23A39' : '#B87710' }}>
                      <i className={`ti ${m.status === 'selesai' ? 'ti-check' : m.status === 'segera' ? 'ti-alert-triangle' : 'ti-settings'}`} aria-hidden="true" />
                    </div>
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
                    {filteredUnits.map(u => (
                      <tr key={u.id} onClick={() => { setSelectedUnit(u); setDetailOpen(true) }}>
                        <td style={{ fontWeight: 600, color: '#171D19' }}>{u.owner}</td>
                        <td>{u.model}</td>
                        <td style={{ color: '#8A8578', fontFamily: 'monospace', fontSize: 11 }}>{u.siri}</td>
                        <td>{u.warranti}</td>
                        <td>{statusBadge(u.dashboard === 'aktif' ? 'aktif' : 'hampir tamat')}</td>
                        <td style={{ color: '#8A8578' }}>{u.servis}</td>
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

      {/* ── TAMBAH UNIT (MODAL) ── */}
      {showAddUnit && (
        <div className="modal-overlay" onClick={() => setShowAddUnit(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Tambah Unit Baru</div>

            {addUnitSuccess ? (
              <>
                <div style={{ background: '#DCF2E7', color: '#178763', borderRadius: 12, padding: '14px 16px', fontSize: 13, marginBottom: 4 }}>
                  ✓ {addUnitSuccess}
                </div>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setShowAddUnit(false)}>Tutup</button>
                  <button className="btn-primary" onClick={openAddUnit}>Tambah Lagi</button>
                </div>
              </>
            ) : (
              <form onSubmit={submitAddUnit}>
                <div className="form-row">
                  <label className="form-label">Owner (pengguna berdaftar)</label>
                  <select className="form-select" value={addUnitForm.ownerId} onChange={e => setAddUnitForm(f => ({ ...f, ownerId: e.target.value }))}>
                    <option value="">— Pilih owner —</option>
                    {userProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name || p.email} ({p.email})</option>
                    ))}
                  </select>
                  {userProfiles.length === 0 && (
                    <div style={{ fontSize: 11, color: '#A6A093', marginTop: 4 }}>Tiada pengguna berdaftar yang belum ada unit.</div>
                  )}
                </div>

                <div className="form-row-2">
                  <div className="form-row">
                    <label className="form-label">No. Siri Unit</label>
                    <input className="form-input" placeholder="SH-2026-0003" value={addUnitForm.serialNumber} onChange={e => setAddUnitForm(f => ({ ...f, serialNumber: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Model</label>
                    <select className="form-select" value={addUnitForm.model} onChange={e => setAddUnitForm(f => ({ ...f, model: e.target.value }))}>
                      <option>SuHu Starter</option>
                      <option>SuHu Pro</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-row">
                    <label className="form-label">Kapasiti Tangki (Liter)</label>
                    <input className="form-input" type="number" value={addUnitForm.kapasitiLiter} onChange={e => setAddUnitForm(f => ({ ...f, kapasitiLiter: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Tarikh Pasang</label>
                    <input className="form-input" type="date" value={addUnitForm.tarikhPasang} onChange={e => setAddUnitForm(f => ({ ...f, tarikhPasang: e.target.value }))} />
                  </div>
                </div>

                <div className="form-row">
                  <label className="form-label">Tarikh Tamat Warranti</label>
                  <input className="form-input" type="date" value={addUnitForm.tarikhWarranti} onChange={e => setAddUnitForm(f => ({ ...f, tarikhWarranti: e.target.value }))} />
                </div>

                <div className="form-row">
                  <label className="form-label">Alamat Lokasi</label>
                  <input className="form-input" placeholder="No 12, Jalan Damai, Ampang" value={addUnitForm.lokasiAlamat} onChange={e => setAddUnitForm(f => ({ ...f, lokasiAlamat: e.target.value }))} />
                </div>

                <div className="form-row">
                  <label className="form-label">Lokasi pada Peta (untuk ramalan cuaca)</label>
                  <LocationPicker
                    lat={addUnitForm.lat}
                    lon={addUnitForm.lon}
                    onChange={(lat, lon) => setAddUnitForm(f => ({ ...f, lat, lon }))}
                  />
                </div>

                {addUnitError && <div className="form-error">{addUnitError}</div>}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddUnit(false)}>Batal</button>
                  <button type="submit" className="btn-primary" disabled={addUnitSaving}>{addUnitSaving ? 'Menyimpan...' : 'Simpan Unit'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
