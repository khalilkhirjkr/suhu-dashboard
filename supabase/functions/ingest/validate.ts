// Pengesahan muatan bacaan sensor daripada ESP32. Fungsi tulen — tiada I/O, boleh diuji dengan Node.
// Julat SEPADAN dengan CHECK `sensor_data_julat_chk` dalam migrasi; ubah kedua-duanya bersama.

export const MAX_BODY_BYTES = 2048

type Rule = { kind: 'number'; min: number; max: number } | { kind: 'boolean' }

// Semua medan wajib. Nilai -1 pada paras air = penanda "sensor gagal baca" (firmware).
const RULES = {
  paras_air_pct:     { kind: 'number', min: -1, max: 100 },
  paras_air_liter:   { kind: 'number', min: -1, max: 5000 },
  hujan_status:      { kind: 'boolean' },
  solar_volt:        { kind: 'number', min: 0, max: 60 },
  bateri_volt:       { kind: 'number', min: 0, max: 60 },
  bateri_pct:        { kind: 'number', min: 0, max: 100 },
  is_wifi_connected: { kind: 'boolean' },
} as const satisfies Record<string, Rule>

export type Reading = {
  paras_air_pct: number
  paras_air_liter: number
  hujan_status: boolean
  solar_volt: number
  bateri_volt: number
  bateri_pct: number
  is_wifi_connected: boolean
}

export type ValidationResult =
  | { ok: true; value: Reading }
  | { ok: false; errors: string[] }

// Medan tambahan (termasuk `unit_id` daripada firmware lama) DIABAIKAN — unit sentiasa
// ditentukan oleh kunci peranti, tak pernah oleh muatan.
export function validateReading(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, errors: ['muatan mesti objek JSON'] }
  }
  const src = body as Record<string, unknown>
  const errors: string[] = []
  const out: Record<string, number | boolean> = {}

  for (const [field, rule] of Object.entries(RULES) as [keyof typeof RULES, Rule][]) {
    const v = src[field]
    if (v === undefined || v === null) { errors.push(`${field}: wajib`); continue }
    if (rule.kind === 'boolean') {
      if (typeof v !== 'boolean') errors.push(`${field}: mesti boolean`)
      else out[field] = v
    } else {
      if (typeof v !== 'number' || !Number.isFinite(v)) errors.push(`${field}: mesti nombor`)
      else if (v < rule.min || v > rule.max) errors.push(`${field}: di luar julat ${rule.min}..${rule.max}`)
      else out[field] = v
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true, value: out as Reading }
}
