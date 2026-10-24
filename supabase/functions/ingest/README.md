# `ingest` — pintu masuk bacaan sensor SuHu

ESP32 menghantar bacaan ke sini, bukan terus ke `sensor_data`. Pelayan mengesahkan **kunci peranti**
per-unit, menentukan unit daripada kunci itu (bukan daripada muatan), menyemak julat dan kadar, kemudian
menulis dengan service role. Menggantikan polisi anon `with check (true)` yang membenarkan sesiapa
menyuntik data.

```
ESP32 ──POST + x-device-key──▶ Edge Function ingest ──service role──▶ sensor_data
                                   │
                                   ├─ hash(kunci) → device_credentials → unit_id   (401 jika tiada/dibatalkan)
                                   ├─ julat/jenis medan (validate.ts)              (400)
                                   ├─ had saiz muatan 2 KB                         (413)
                                   ├─ min. 5 saat antara bacaan per unit           (429)
                                   └─ liter ≤ kapasiti unit × 1.05                 (400)
```

## Fail

| Fail | Fungsi |
|---|---|
| `../../migrations/20260921000000_device_ingest_credentials.sql` | Fasa 1: jadual `device_credentials`, fungsi jana kunci, `CHECK` julat, indeks. **Selamat** — tak ubah polisi anon. |
| `../../manual/2_tutup_anon_insert.sql` | Fasa 2: buang polisi anon + `revoke`. **Jangan jalankan awal.** |
| `index.ts` / `handler.ts` / `validate.ts` | Edge Function (Deno). Logik dalam `handler.ts` dengan DB disuntik. |
| `handler.test.ts` | 16 ujian: `node --test supabase/functions/ingest/handler.test.ts` |

## Pengujian yang sudah dibuat

- 16 ujian unit lulus (auth, spoof `unit_id`, julat, kadar, saiz, ralat DB).
- Migrasi fasa 1 dan skrip fasa 2 diuji terhadap DB sebenar dalam transaksi yang **dibatalkan** (tiada apa kekal):
  jana/putar kunci, penolakan pengguna biasa/anon, admin dan service_role dibenarkan, `CHECK`, unik satu-kunci-aktif;
  selepas fasa 2: anon ditolak, pemilik unit masih nampak datanya sahaja, service_role masih boleh menulis, pendaftaran pengguna masih menjana profil.
- **Belum diuji:** Edge Function yang sebenar-benar ter-deploy (Deno tiada pada mesin ini) dan firmware
  (tiada `arduino-cli`; belum di-compile atau di-flash). Langkah 3–6 di bawah menguji kedua-duanya.

## Runbook — ikut susunan ini

Susunan penting: jika polisi anon dibuang sebelum firmware baharu berjalan, **ESP32 berhenti menghantar data**.

1. **Laksana migrasi fasa 1** (`supabase db push`, atau `apply_migration`).
2. **Deploy function tanpa JWT** (peranti tiada JWT; kunci peranti ialah pengesahannya):
   ```bash
   supabase functions deploy ingest --no-verify-jwt --project-ref tbwhrhzsojrofemtrmxh
   ```
3. **Smoke test tanpa kunci sah** (kedua-duanya mesti `401`):
   ```bash
   URL=https://tbwhrhzsojrofemtrmxh.supabase.co/functions/v1/ingest
   curl -s -o /dev/null -w "%{http_code}\n" -X POST $URL -d '{}'
   curl -s -o /dev/null -w "%{http_code}\n" -X POST $URL -H "x-device-key: $(printf 'a%.0s' {1..64})" -d '{}'
   ```
4. **Jana kunci untuk unit** (SQL editor sebagai `postgres`). Kunci dipaparkan **sekali sahaja**; salin terus:
   ```sql
   select public._issue_device_key('82af1364-00e5-4254-88fe-bbbc42097ee2', 'ESP32 SH-2026-0001');
   ```
5. **Sahkan kunci diterima tanpa menulis apa-apa** — muatan kosong mesti `400 invalid_payload` (bukan `401`):
   ```bash
   curl -s -X POST $URL -H "x-device-key: <KUNCI>" -d '{}'
   ```
6. **Firmware:** buka `suhu_firmware_v2109261229`, letak kunci dalam `secrets.h` (`DEVICE_KEY`), biar `USE_ROOT_CA 0`,
   compile + flash. Serial monitor mesti tunjuk `Upload ingest: HTTP 201`. Semak DB:
   `select max(created_at) from sensor_data where unit_id = '…'` dan `device_credentials.last_used_at` terkini.
7. **Aktifkan pengesahan sijil:** tukar `USE_ROOT_CA` kepada `1`, flash semula, sahkan masih `HTTP 201`.
   (Jika jadi `-1`/`-5`, sijil gagal disahkan — kembali ke `0` dan semak `certs.h`.)
8. **Fasa 2** hanya selepas **setiap** unit yang menghantar data sudah lulus langkah 6–7.
   Semak: `select unit_id, max(created_at) from sensor_data group by 1;`
   Kemudian jalankan `supabase/manual/2_tutup_anon_insert.sql`, dan sahkan suntikan lama ditolak:
   ```bash
   curl -s -X POST https://tbwhrhzsojrofemtrmxh.supabase.co/rest/v1/sensor_data \
     -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>" -H "Content-Type: application/json" \
     -d '{"unit_id":"82af1364-00e5-4254-88fe-bbbc42097ee2","paras_air_pct":1,"paras_air_liter":1,"solar_volt":0,"bateri_pct":0}'
   # mesti: permission denied (42501)
   ```

## Operasi

- **Putar kunci** (kunci lama terbatal serta-merta): ulang langkah 4, kemudian flash kunci baharu.
- **Batalkan sahaja** (unit hilang/dicuri): `update device_credentials set revoked_at = now() where unit_id = '…';`
- **Daftar unit baharu:** cipta unit → jana kunci (langkah 4) → letak dalam `secrets.h` unit itu. Satu kunci per unit; jangan kongsi.
- **Fungsi `rotate_device_key`** boleh dipanggil oleh admin melalui `supabase.rpc(...)` supaya kunci dijana dari Admin Dashboard
  (belum ada UI — kini guna SQL editor).

## Had yang perlu diterima

- Sesiapa yang **memegang peranti** boleh mengeluarkan kunci daripada flash (kecuali *flash encryption* + *secure boot* ESP32 diaktifkan)
  atau memberi input palsu kepada sensor. Kunci per-unit mengehadkan kerosakan kepada unit itu sahaja, dan boleh dibatalkan.
- Had kadar diuji berdasarkan `created_at` baris terakhir; permintaan serentak yang tepat-tepat sama masa boleh lepas kedua-duanya.
  Mencukupi untuk mengekang banjir; bukan jaminan mutlak.
- Pin sijil akar (`USE_ROOT_CA 1`) bermakna jika Supabase menukar CA di luar tiga akar dalam `certs.h`, peranti perlu di-reflash.
  Firmware belum ada OTA.
