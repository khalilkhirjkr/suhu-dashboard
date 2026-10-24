// Status bateri & pengecasan solar — diterbitkan daripada trend voltan bateri.
// Unit TIADA sensor solar; "mengecas" disimpulkan apabila voltan bateri naik dalam tempoh terkini.

// Bawah nilai ini = tiada sensor bateri (firmware hantar 0 sehingga B25 dipasang) atau bacaan sesat.
// Bateri 12 V paling rendah ~10 V, jadi 8 V selamat memisahkan "tiada sensor" daripada "bateri lemah".
export const BATTERY_MIN_VALID_V = 8

const WINDOW_MIN = 60        // bandingkan bacaan dalam 60 minit terakhir
const MIN_SPAN_MIN = 10      // perlu sekurang-kurangnya 10 minit data
const GROUP = 3              // purata 3 bacaan terbaru vs 3 bacaan tertua dalam tetingkap (kurangkan hingar ADC)
const TREND_DELTA_V = 0.10   // perubahan >= 0.10 V dianggap trend sebenar, bukan hingar

export function hasBatteryReading(r) {
  return !!r && typeof r.bateri_volt === 'number' && r.bateri_volt >= BATTERY_MIN_VALID_V
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length

/**
 * @param readings bacaan terbaru dahulu (seperti state `readings` dalam dashboard)
 * @returns {{ state: 'charging'|'discharging'|'stable'|'unknown'|'no-sensor', deltaV: number|null }}
 */
export function chargeTrend(readings) {
  if (!readings || readings.length === 0 || !hasBatteryReading(readings[0])) {
    return { state: 'no-sensor', deltaV: null }
  }
  const newest = new Date(readings[0].created_at).getTime()
  const win = readings.filter(
    (r) => hasBatteryReading(r) && newest - new Date(r.created_at).getTime() <= WINDOW_MIN * 60000,
  )
  if (win.length < GROUP * 2) return { state: 'unknown', deltaV: null }
  const spanMin = (newest - new Date(win[win.length - 1].created_at).getTime()) / 60000
  if (spanMin < MIN_SPAN_MIN) return { state: 'unknown', deltaV: null }

  const deltaV = mean(win.slice(0, GROUP).map((r) => r.bateri_volt))
               - mean(win.slice(-GROUP).map((r) => r.bateri_volt))
  if (deltaV >= TREND_DELTA_V) return { state: 'charging', deltaV }
  if (deltaV <= -TREND_DELTA_V) return { state: 'discharging', deltaV }
  return { state: 'stable', deltaV }
}

export const CHARGE_LABEL = {
  charging: 'Mengecas',
  discharging: 'Menyahcas',
  stable: 'Stabil',
  unknown: 'Mengumpul data',
  'no-sensor': 'Tiada sensor bateri',
}
