// Edge Function `ingest` — satu-satunya pintu masuk bacaan sensor daripada ESP32.
//
// Deploy TANPA pengesahan JWT (peranti tiada JWT; kunci peranti ialah pengesahannya):
//   supabase functions deploy ingest --no-verify-jwt
//
// SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY disuntik automatik oleh Supabase.
// Service role key TIDAK pernah berada dalam firmware — ia hanya wujud di sini.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { handle, type Db } from './handler.ts'
import type { Reading } from './validate.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const db: Db = {
  async findCredential(keyHash) {
    const { data, error } = await supabase
      .from('device_credentials')
      .select('id, unit_id')
      .eq('key_hash', keyHash)
      .is('revoked_at', null)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async getUnitCapacity(unitId) {
    const { data, error } = await supabase.from('units').select('kapasiti_liter').eq('id', unitId).maybeSingle()
    if (error) throw error
    return data?.kapasiti_liter ?? null
  },

  async getLastReadingAt(unitId) {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('created_at')
      .eq('unit_id', unitId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data?.created_at ?? null
  },

  async insertReading(unitId, reading: Reading) {
    const { error } = await supabase.from('sensor_data').insert({ unit_id: unitId, ...reading })
    if (error) throw error
  },

  async touchCredential(id) {
    const { error } = await supabase.from('device_credentials').update({ last_used_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
  },
}

Deno.serve((req) => handle(req, db))
