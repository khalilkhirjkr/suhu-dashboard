import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_CENTER = [3.139, 101.6869] // KL — fallback bila belum ada lokasi

function ClickHandler({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng) } })
  return null
}

function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => { if (position) map.setView(position, 15) }, [position, map])
  return null
}

// lat/lon (number|null), onChange(lat, lon)
export default function LocationPicker({ lat, lon, onChange }) {
  const [address, setAddress] = useState('')
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const position = (lat != null && lon != null) ? [lat, lon] : null

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setErrorMsg('Peranti/pelayar tidak menyokong geolocation.'); return }
    setLocating(true)
    setErrorMsg('')
    navigator.geolocation.getCurrentPosition(
      (pos) => { onChange(pos.coords.latitude, pos.coords.longitude); setLocating(false) },
      (err) => { setErrorMsg('Gagal dapatkan lokasi semasa: ' + err.message); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const searchAddress = async () => {
    if (!address.trim()) return
    setSearching(true)
    setErrorMsg('')
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(address)}&count=1&language=ms&country=MY`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        onChange(data.results[0].latitude, data.results[0].longitude)
      } else {
        setErrorMsg('Lokasi tidak dijumpai — cuba nama bandar/daerah sahaja (cth: "Kajang" bukan alamat penuh).')
      }
    } catch {
      setErrorMsg('Gagal cari lokasi — semak sambungan internet.')
    }
    setSearching(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#DCF2E7', color: '#178763', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}
      >
        📍 {locating ? 'Mencari lokasi...' : 'Guna Lokasi Semasa'}
      </button>

      <div style={{ height: 220, borderRadius: 12, overflow: 'hidden', marginBottom: 10, border: '1px solid #F0E9DA' }}>
        <MapContainer center={position || DEFAULT_CENTER} zoom={position ? 15 : 6} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          <ClickHandler onPick={onChange} />
          <RecenterMap position={position} />
          {position && (
            <Marker
              position={position}
              draggable
              eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); onChange(p.lat, p.lng) } }}
            />
          )}
        </MapContainer>
      </div>
      <div style={{ fontSize: 11, color: '#A6A093', marginBottom: 10 }}>Klik atau seret pin pada peta untuk laraskan lokasi tepat.</div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Atau taip bandar/poskod (cth: Kajang, 43000)"
          value={address}
          onChange={e => setAddress(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); searchAddress() } }}
          style={{ flex: 1, background: '#FBF8F1', border: '1px solid #F0E9DA', borderRadius: 9, color: '#171D19', fontSize: 13, padding: '9px 12px', fontFamily: 'inherit', outline: 'none' }}
        />
        <button
          type="button"
          onClick={searchAddress}
          disabled={searching}
          style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
        >
          {searching ? '...' : 'Cari'}
        </button>
      </div>

      {errorMsg && <div style={{ color: '#C23A39', fontSize: 12, marginTop: 8 }}>{errorMsg}</div>}
      {position && <div style={{ fontSize: 12, color: '#8A8578', marginTop: 8 }}>Koordinat: {position[0].toFixed(5)}, {position[1].toFixed(5)}</div>}
    </div>
  )
}
