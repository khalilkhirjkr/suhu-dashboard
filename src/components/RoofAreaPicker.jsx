import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { polygonAreaM2 } from '../lib/geo'

const DEFAULT_CENTER = [3.139, 101.6869]
const MAX_AREA_M2 = 5000

const vertexIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid #1D9E75;box-shadow:0 0 0 1px rgba(0,0,0,.25)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function ClickHandler({ onAdd }) {
  useMapEvents({ click(e) { onAdd([e.latlng.lat, e.latlng.lng]) } })
  return null
}

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => { if (center) map.setView(center, 19) }, [center, map])
  return null
}

const btn = { background: '#F5F0E5', color: '#171D19', border: '1px solid #E3DAC4', borderRadius: 9, padding: '8px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }

// lat/lon: lokasi unit (untuk pusatkan peta). points: [[lat,lng],...]. value: luas (m2) sebagai string.
// onChange(points, luasString) — luas dikira semula setiap kali titik berubah.
export default function RoofAreaPicker({ lat, lon, points, value, onChange }) {
  const center = (lat != null && lon != null) ? [lat, lon] : null

  const update = (nextPoints) => {
    const area = polygonAreaM2(nextPoints)
    if (nextPoints.length >= 3) onChange(nextPoints, String(Math.round(area * 10) / 10))
    else if (points.length >= 3) onChange(nextPoints, '') // poligon rosak — buang luas lama
    else onChange(nextPoints, value)
  }

  const tooLarge = Number(value) > MAX_AREA_M2

  return (
    <div>
      {!center && (
        <div style={{ fontSize: 12.5, color: '#B87710', background: '#FDF0DC', border: '1px solid #EFCB8E', borderRadius: 9, padding: '8px 12px', marginBottom: 10 }}>
          Tetapkan lokasi unit pada peta di atas dahulu supaya peta ini zoom ke rumah pelanggan.
        </div>
      )}

      <div style={{ height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 8, border: '1px solid #F0E9DA' }}>
        <MapContainer center={center || DEFAULT_CENTER} zoom={center ? 19 : 6} maxZoom={19} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution='&copy; OpenStreetMap contributors' />
          <ClickHandler onAdd={(pt) => update([...points, pt])} />
          <RecenterMap center={center} />
          {points.length >= 3 && <Polygon positions={points} pathOptions={{ color: '#1D9E75', fillColor: '#1D9E75', fillOpacity: 0.25, weight: 2 }} />}
          {points.map((p, i) => (
            <Marker
              key={i}
              position={p}
              icon={vertexIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = e.target.getLatLng()
                  update(points.map((q, j) => (j === i ? [ll.lat, ll.lng] : q)))
                },
              }}
            />
          ))}
        </MapContainer>
      </div>

      <div style={{ fontSize: 11.5, color: '#A6A093', marginBottom: 10 }}>
        Klik pada peta untuk tandakan sudut bumbung yang disalurkan ke tangki (lukis dari atas, tiada garis bersilang). Seret titik untuk laras.
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" style={btn} disabled={points.length === 0} onClick={() => update(points.slice(0, -1))}>Buat asal titik</button>
        <button type="button" style={btn} disabled={points.length === 0} onClick={() => onChange([], '')}>Kosongkan</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.1"
            placeholder="atau taip terus"
            value={value}
            onChange={e => onChange(points, e.target.value)}
            style={{ width: 130 }}
          />
          <span style={{ fontSize: 13, color: '#5C5850' }}>m²</span>
        </div>
      </div>

      {points.length >= 3 && (
        <div style={{ fontSize: 12.5, color: '#178763', marginTop: 8 }}>
          Luas dilukis: <strong>{(Math.round(polygonAreaM2(points) * 10) / 10).toLocaleString('ms-MY')} m²</strong> (unjuran mendatar)
        </div>
      )}
      {tooLarge && (
        <div className="form-error" style={{ marginTop: 8 }}>Luas melebihi {MAX_AREA_M2.toLocaleString('ms-MY')} m² — semak semula lukisan.</div>
      )}
    </div>
  )
}

export { MAX_AREA_M2 }
