-- ============================================================================
-- FASA 2 — TUTUP pintu suntikan anon.   ⚠️  JANGAN jalankan sebelum syarat di bawah dipenuhi.
--
-- Fail ini SENGAJA tidak berada dalam supabase/migrations supaya `supabase db push`
-- tak melaksanakannya secara tak sengaja bersama fasa 1.
--
-- Syarat sebelum dijalankan (semua mesti benar):
--   [ ] Migrasi fasa 1 sudah dilaksanakan
--   [ ] Edge Function `ingest` sudah di-deploy (verify_jwt = false)
--   [ ] Setiap unit fizikal sudah di-reflash dengan firmware baharu + kunci peranti
--   [ ] Bacaan baharu daripada SETIAP unit sudah masuk melalui `ingest`
--       (semak: select unit_id, max(created_at) from sensor_data group by 1;
--        dan device_credentials.last_used_at terkini)
--
-- Kesan jika dijalankan terlalu awal: ESP32 lama berhenti menghantar data (ditolak RLS).
-- Pemulihan segera: lihat bahagian "ROLLBACK" di bawah.
-- ============================================================================

begin;

-- 1) Buang polisi yang membenarkan sesiapa memasukkan baris tanpa pengesahan
drop policy if exists "unit insert sensor data" on public.sensor_data;

-- 2) Web app hanya guna peranan `authenticated` selepas log masuk. `anon` tak perlu
--    sebarang akses jadual — jadi keselamatan tak lagi bergantung pada RLS semata-mata.
revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

-- 3) Jadual/fungsi BAHARU yang dicipta kemudian tak mewarisi akses anon
alter default privileges for role postgres in schema public revoke all on tables    from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;
alter default privileges for role postgres in schema public revoke all on functions from anon;

commit;

-- ============================================================================
-- ROLLBACK (kecemasan sahaja — membuka semula suntikan anon; ESP32 lama akan berfungsi semula)
-- ============================================================================
-- create policy "unit insert sensor data" on public.sensor_data
--   for insert to anon with check (true);
-- grant insert on public.sensor_data to anon;
