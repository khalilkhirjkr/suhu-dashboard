import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Bateri 12 V paling rendah ~10 V. Di bawah nilai ini = tiada sensor B25 (firmware hantar 0 sehingga B25 dipasang).
// Sama dengan BATTERY_MIN_VALID_V dalam src/lib/battery.js.
const BATTERY_MIN_VALID_V = 8;

type Unit = { id: string; owner_id: string; serial_number: string; lokasi_alamat: string | null; lokasi_lat: number | null; lokasi_lon: number | null };

const ALERT_MESSAGES: Record<string, (u: Unit) => { subject: string; html: string }> = {
  tangki_penuh: (u) => ({
    subject: `⚠️ Tangki Hampir Penuh — ${u.serial_number}`,
    html: `<p>Paras air tangki <strong>${u.serial_number}</strong> (${u.lokasi_alamat || "lokasi tidak diketahui"}) telah melebihi 90%.</p>`,
  }),
  tangki_kosong: (u) => ({
    subject: `💧 Tangki Hampir Kosong — ${u.serial_number}`,
    html: `<p>Paras air tangki <strong>${u.serial_number}</strong> (${u.lokasi_alamat || "lokasi tidak diketahui"}) kurang dari 20%.</p>`,
  }),
  unit_offline: (u) => ({
    subject: `🔌 Unit Luar Talian — ${u.serial_number}`,
    html: `<p>Unit <strong>${u.serial_number}</strong> tidak menghantar data lebih 2 jam. Sila semak sambungan WiFi/kuasa unit.</p>`,
  }),
  bateri_rendah: (u) => ({
    subject: `🔋 Bateri Rendah — ${u.serial_number}`,
    html: `<p>Peratus bateri unit <strong>${u.serial_number}</strong> kurang dari 15%.</p>`,
  }),
  sensor_gagal: (u) => ({
    subject: `📡 Sensor Paras Air Gagal Baca — ${u.serial_number}`,
    html: `<p>Sensor paras air unit <strong>${u.serial_number}</strong> gagal memberi bacaan sah sejak lebih 30 minit. Sila semak wiring/kedudukan sensor AJ-SR04M.</p>`,
  }),
  // Tidak lagi dicetuskan: unit tiada sensor solar. Dikekalkan supaya keutamaan notifikasi sedia ada tidak rosak.
  bateri_tak_charge: (u) => ({
    subject: `⚡ Bateri Tidak Mengecas — ${u.serial_number}`,
    html: `<p>Voltan bateri unit <strong>${u.serial_number}</strong> tidak meningkat dalam 3 jam terakhir. Mungkin isu pada charge controller atau bateri.</p>`,
  }),
  risiko_overflow: (u) => ({
    subject: `🌧️ Risiko Melimpah — ${u.serial_number}`,
    html: `<p>Ramalan hujan lebat untuk hari ini di lokasi unit <strong>${u.serial_number}</strong>, manakala paras tangki sudah melebihi 70%. Risiko tangki melimpah.</p>`,
  }),
};

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SuHu Dashboard <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) console.error("Resend error:", await res.text());
  return res.ok;
}

async function setAlertState(unitId: string, alertType: string, active: boolean) {
  const payload: Record<string, unknown> = {
    unit_id: unitId,
    alert_type: alertType,
    is_active: active,
    updated_at: new Date().toISOString(),
  };
  if (active) payload.last_sent_at = new Date().toISOString();
  await supabase.from("alert_state").upsert(payload, { onConflict: "unit_id,alert_type" });
}

Deno.serve(async (req: Request) => {
  const providedSecret = req.headers.get("x-cron-secret");
  if (providedSecret !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const results: unknown[] = [];

  const { data: units } = await supabase.from("units").select("*");
  if (!units) return new Response(JSON.stringify({ error: "no units" }), { status: 500 });

  for (const unit of units as Unit[]) {
    const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", unit.owner_id).single();
    if (!profile?.email) continue;

    const { data: prefs } = await supabase.from("notification_preferences").select("*").eq("user_id", unit.owner_id).single();
    const pref = (key: string) => (prefs ? Boolean((prefs as Record<string, unknown>)[key]) : true);

    const { data: alertRows } = await supabase.from("alert_state").select("*").eq("unit_id", unit.id);
    const stateMap: Record<string, boolean> = {};
    for (const row of alertRows || []) stateMap[row.alert_type] = row.is_active;

    // Bacaan terkini (satu baris) dan tetingkap berasaskan masa. Penghantaran berasaskan peristiwa
    // menjadikan bilangan baris dalam satu tempoh tidak tetap, jadi tetingkap TIDAK boleh berasaskan limit(N).
    const now = Date.now();
    const since = new Date(now - 3 * 60 * 60 * 1000).toISOString();
    const { data: latestRows } = await supabase
      .from("sensor_data")
      .select("*")
      .eq("unit_id", unit.id)
      .order("created_at", { ascending: false })
      .limit(1);
    const latest = latestRows?.[0];
    if (!latest) continue;

    const { data: recent } = await supabase
      .from("sensor_data")
      .select("created_at, paras_air_pct")
      .eq("unit_id", unit.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);

    const latestAgeMin = (now - new Date(latest.created_at).getTime()) / 60000;
    const isFresh = latestAgeMin < 120;

    async function evaluate(type: string, condition: boolean) {
      if (!pref(type)) return;
      const wasActive = stateMap[type] || false;
      if (condition && !wasActive) {
        const msg = ALERT_MESSAGES[type](unit);
        const ok = await sendEmail(profile!.email, msg.subject, msg.html);
        results.push({ unit: unit.serial_number, type, sent: ok });
        await setAlertState(unit.id, type, true);
      } else if (!condition && wasActive) {
        await setAlertState(unit.id, type, false);
      }
    }

    await evaluate("tangki_penuh", isFresh && latest.paras_air_pct >= 90);
    await evaluate("tangki_kosong", isFresh && latest.paras_air_pct >= 0 && latest.paras_air_pct < 20);
    await evaluate("unit_offline", latestAgeMin >= 120);

    // Bateri rendah hanya bermakna jika sensor B25 dipasang. Tanpa B25 firmware hantar bateri_volt = 0 dan
    // bateri_pct = 0, yang dulu mencetuskan e-mel "Bateri Rendah" palsu.
    const hasBatterySensor = typeof latest.bateri_volt === "number" && latest.bateri_volt >= BATTERY_MIN_VALID_V;
    await evaluate("bateri_rendah", isFresh && hasBatterySensor && latest.bateri_pct != null && latest.bateri_pct < 15);

    // Sensor gagal: semua bacaan dalam 35 minit terakhir ialah gagal baca (paras -1).
    const last35min = (recent || []).filter((r) => (now - new Date(r.created_at).getTime()) / 60000 <= 35);
    const sensorGagal = last35min.length > 0 && last35min.every((r) => r.paras_air_pct < 0);
    await evaluate("sensor_gagal", sensorGagal);

    // Bateri tak mengecas: tiada sensor solar, jadi tak boleh dinilai. Sentiasa "tidak aktif" supaya
    // amaran lama dibersihkan. Reka semula menggunakan trend bateri_volt apabila B25 dipasang.
    await evaluate("bateri_tak_charge", false);

    if (unit.lokasi_lat != null && unit.lokasi_lon != null && isFresh && latest.paras_air_pct > 70) {
      try {
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${unit.lokasi_lat}&longitude=${unit.lokasi_lon}&daily=precipitation_sum&timezone=Asia%2FKuala_Lumpur&forecast_days=1`);
        const wData = await wRes.json();
        const rainToday = wData?.daily?.precipitation_sum?.[0] ?? 0;
        await evaluate("risiko_overflow", rainToday >= 20);
      } catch (e) {
        console.error("weather fetch failed", e);
      }
    } else {
      // Syarat tidak lagi dipenuhi (tangki surut, atau data lapuk): bersihkan amaran lama.
      // Dulu amaran kekal "aktif" selama-lamanya kerana hanya dinilai bila paras > 70%.
      await evaluate("risiko_overflow", false);
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
