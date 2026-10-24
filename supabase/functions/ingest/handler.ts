// Logik permintaan `ingest`, dengan akses DB disuntik (Db) supaya boleh diuji tanpa Deno/Supabase.
import { MAX_BODY_BYTES, validateReading, type Reading } from './validate.ts'

export const MIN_INTERVAL_MS = 5_000
// Toleransi pada kapasiti tangki (anggaran geometri/jitter sensor) sebelum liter dianggap mustahil.
const CAPACITY_TOLERANCE = 1.05
const DEFAULT_CAPACITY_LITER = 2000 // sepadan dengan default lajur units.kapasiti_liter

export interface Db {
  findCredential(keyHash: string): Promise<{ id: string; unit_id: string } | null>
  getUnitCapacity(unitId: string): Promise<number | null>
  getLastReadingAt(unitId: string): Promise<string | null>
  insertReading(unitId: string, reading: Reading): Promise<void>
  touchCredential(id: string): Promise<void>
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('')
}

export async function handle(req: Request, db: Db, now: () => number = Date.now): Promise<Response> {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { Allow: 'POST' })

  // 1) Sahkan peranti DAHULU (murah) — sebelum baca/parse muatan.
  //    Semua kegagalan (tiada kunci / format salah / tak dikenali / dibatalkan) → 401 yang sama,
  //    supaya penyerang tak boleh membezakan sebabnya.
  const key = req.headers.get('x-device-key') ?? ''
  if (!/^[0-9a-f]{64}$/.test(key)) return json(401, { error: 'unauthorized' })

  let cred: { id: string; unit_id: string } | null
  try {
    cred = await db.findCredential(await sha256Hex(key))
  } catch (e) {
    console.error('findCredential gagal', e)
    return json(500, { error: 'server_error' })
  }
  if (!cred) return json(401, { error: 'unauthorized' })

  // 2) Had saiz muatan
  const declared = Number(req.headers.get('content-length') ?? '0')
  if (declared > MAX_BODY_BYTES) return json(413, { error: 'payload_too_large' })
  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'payload_too_large' })

  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return json(400, { error: 'invalid_json' }) }

  // 3) Sahkan julat/jenis
  const result = validateReading(parsed)
  if (!result.ok) return json(400, { error: 'invalid_payload', details: result.errors })

  try {
    // 4) Had kadar + kapasiti unit
    const [lastAt, capacity] = await Promise.all([
      db.getLastReadingAt(cred.unit_id),
      db.getUnitCapacity(cred.unit_id),
    ])

    if (lastAt) {
      const waitMs = MIN_INTERVAL_MS - (now() - new Date(lastAt).getTime())
      if (waitMs > 0) {
        return json(429, { error: 'too_many_requests' }, { 'Retry-After': String(Math.ceil(waitMs / 1000)) })
      }
    }

    const maxLiter = (capacity ?? DEFAULT_CAPACITY_LITER) * CAPACITY_TOLERANCE
    if (result.value.paras_air_liter > maxLiter) {
      return json(400, { error: 'invalid_payload', details: [`paras_air_liter: melebihi kapasiti tangki unit`] })
    }

    // 5) Simpan — unit_id datang daripada kunci, BUKAN muatan
    await db.insertReading(cred.unit_id, result.value)
  } catch (e) {
    console.error('ingest gagal', e)
    return json(500, { error: 'server_error' })
  }

  // last_used_at: usaha terbaik sahaja, kegagalan tak menjejaskan bacaan yang sudah disimpan
  db.touchCredential(cred.id).catch(e => console.error('touchCredential gagal', e))

  return json(201, { ok: true })
}
