// Jalankan:  node --test supabase/functions/ingest/handler.test.ts   (atau `deno test`)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { handle, sha256Hex, MIN_INTERVAL_MS, type Db } from './handler.ts'
import { validateReading, type Reading } from './validate.ts'

const KEY = 'a'.repeat(64)
const UNIT = '82af1364-00e5-4254-88fe-bbbc42097ee2'
const NOW = Date.parse('2026-09-21T04:00:00Z')

const GOOD: Reading = {
  paras_air_pct: 86.3, paras_air_liter: 543.7, hujan_status: false,
  solar_volt: 0, bateri_volt: 0, bateri_pct: 0, is_wifi_connected: true,
}

async function makeDb(over: Partial<Db> & { capacity?: number | null; lastAt?: string | null; validHash?: string | null } = {}) {
  const calls = { find: 0, insert: [] as Array<{ unitId: string; reading: Reading }>, touch: 0 }
  const validHash = over.validHash === undefined ? await sha256Hex(KEY) : over.validHash
  const db: Db = {
    async findCredential(hash) { calls.find++; return hash === validHash ? { id: 'cred-1', unit_id: UNIT } : null },
    async getUnitCapacity() { return over.capacity === undefined ? 630 : over.capacity },
    async getLastReadingAt() { return over.lastAt === undefined ? null : over.lastAt },
    async insertReading(unitId, reading) { calls.insert.push({ unitId, reading }) },
    async touchCredential() { calls.touch++ },
    ...over,
  }
  return { db, calls }
}

const post = (body: unknown, headers: Record<string, string> = { 'x-device-key': KEY }) =>
  new Request('http://ingest.test/', { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) })

test('bukan POST → 405', async () => {
  const { db } = await makeDb()
  const res = await handle(new Request('http://ingest.test/', { method: 'GET' }), db, () => NOW)
  assert.equal(res.status, 405)
})

test('tiada kunci / format salah → 401 tanpa sentuh DB', async () => {
  for (const headers of [{}, { 'x-device-key': 'pendek' }, { 'x-device-key': 'Z'.repeat(64) }, { 'x-device-key': 'A'.repeat(64) }]) {
    const { db, calls } = await makeDb()
    const res = await handle(post(GOOD, headers), db, () => NOW)
    assert.equal(res.status, 401)
    assert.equal(calls.find, 0)
    assert.equal(calls.insert.length, 0)
  }
})

test('kunci tak dikenali atau dibatalkan → 401, mesej sama', async () => {
  const { db, calls } = await makeDb({ validHash: null }) // findCredential sentiasa null
  const res = await handle(post(GOOD), db, () => NOW)
  assert.equal(res.status, 401)
  assert.deepEqual(await res.json(), { error: 'unauthorized' })
  assert.equal(calls.insert.length, 0)
})

test('kunci sah → 201, unit diambil daripada kunci', async () => {
  const { db, calls } = await makeDb()
  const res = await handle(post(GOOD), db, () => NOW)
  assert.equal(res.status, 201)
  assert.equal(calls.insert.length, 1)
  assert.equal(calls.insert[0].unitId, UNIT)
  assert.deepEqual(calls.insert[0].reading, GOOD)
})

test('unit_id dalam muatan (spoof / firmware lama) diabaikan', async () => {
  const { db, calls } = await makeDb()
  const res = await handle(post({ ...GOOD, unit_id: '7176fc36-0740-4883-9fc8-40a93cb06f25', id: 1, created_at: '2000-01-01' }), db, () => NOW)
  assert.equal(res.status, 201)
  assert.equal(calls.insert[0].unitId, UNIT)
  assert.equal('unit_id' in calls.insert[0].reading, false)
  assert.equal('created_at' in calls.insert[0].reading, false)
})

test('JSON rosak → 400; bukan objek → 400', async () => {
  const { db } = await makeDb()
  assert.equal((await handle(post('{bukan json'), db, () => NOW)).status, 400)
  assert.equal((await handle(post('[1,2,3]'), db, () => NOW)).status, 400)
})

test('nilai di luar julat / jenis salah / medan hilang → 400, tiada INSERT', async () => {
  const bad: unknown[] = [
    { ...GOOD, paras_air_pct: 150 },
    { ...GOOD, paras_air_pct: -2 },
    { ...GOOD, solar_volt: 61 },
    { ...GOOD, bateri_pct: '50' },
    { ...GOOD, hujan_status: 'true' },
    { ...GOOD, paras_air_liter: null },
    (({ solar_volt: _omit, ...rest }) => rest)(GOOD),
  ]
  for (const body of bad) {
    const { db, calls } = await makeDb()
    const res = await handle(post(body), db, () => NOW)
    assert.equal(res.status, 400, JSON.stringify(body))
    assert.equal(calls.insert.length, 0)
  }
})

test('penanda -1 (sensor gagal baca) dibenarkan', async () => {
  const { db, calls } = await makeDb()
  const res = await handle(post({ ...GOOD, paras_air_pct: -1, paras_air_liter: -1 }), db, () => NOW)
  assert.equal(res.status, 201)
  assert.equal(calls.insert.length, 1)
})

test('had kadar: baris terakhir 2 saat lalu → 429 + Retry-After; selepas selang → 201', async () => {
  const twoSecAgo = new Date(NOW - 2000).toISOString()
  const { db, calls } = await makeDb({ lastAt: twoSecAgo })
  const res = await handle(post(GOOD), db, () => NOW)
  assert.equal(res.status, 429)
  assert.equal(res.headers.get('retry-after'), '3')
  assert.equal(calls.insert.length, 0)

  const later = await makeDb({ lastAt: new Date(NOW - MIN_INTERVAL_MS - 1).toISOString() })
  assert.equal((await handle(post(GOOD), later.db, () => NOW)).status, 201)
})

test('liter melebihi kapasiti unit (630L × 1.05) → 400', async () => {
  const { db, calls } = await makeDb({ capacity: 630 })
  assert.equal((await handle(post({ ...GOOD, paras_air_liter: 700 }), db, () => NOW)).status, 400)
  assert.equal(calls.insert.length, 0)
  const ok = await makeDb({ capacity: 630 })
  assert.equal((await handle(post({ ...GOOD, paras_air_liter: 660 }), ok.db, () => NOW)).status, 201)
})

test('kapasiti tak diketahui → guna lalai 2000L', async () => {
  const { db } = await makeDb({ capacity: null })
  assert.equal((await handle(post({ ...GOOD, paras_air_liter: 1500 }), db, () => NOW)).status, 201)
})

test('muatan terlalu besar → 413 (header dan isi sebenar)', async () => {
  const { db } = await makeDb()
  const viaHeader = await handle(post(GOOD, { 'x-device-key': KEY, 'content-length': '999999' }), db, () => NOW)
  assert.equal(viaHeader.status, 413)
  const viaBody = await handle(post({ ...GOOD, sampah: 'x'.repeat(3000) }), db, () => NOW)
  assert.equal(viaBody.status, 413)
})

test('ralat DB → 500 tanpa bocor butiran', async () => {
  const { db } = await makeDb({ async insertReading() { throw new Error('rahsia: connection string ...') } })
  const res = await handle(post(GOOD), db, () => NOW)
  assert.equal(res.status, 500)
  assert.deepEqual(await res.json(), { error: 'server_error' })
})

test('ralat DB semasa semak kunci → 500, bukan 401/201', async () => {
  const { db } = await makeDb({ async findCredential() { throw new Error('db down') } })
  assert.equal((await handle(post(GOOD), db, () => NOW)).status, 500)
})

test('kegagalan touchCredential tak menjejaskan bacaan', async () => {
  const { db, calls } = await makeDb({ async touchCredential() { throw new Error('gagal') } })
  const res = await handle(post(GOOD), db, () => NOW)
  assert.equal(res.status, 201)
  assert.equal(calls.insert.length, 1)
})

test('validateReading: NaN / Infinity ditolak', () => {
  assert.equal(validateReading({ ...GOOD, solar_volt: NaN }).ok, false)
  assert.equal(validateReading({ ...GOOD, solar_volt: Infinity }).ok, false)
})
