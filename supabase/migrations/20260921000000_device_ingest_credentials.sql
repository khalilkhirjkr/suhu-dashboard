-- ============================================================================
-- FASA 1 — kelayakan peranti untuk Edge Function `ingest` + pagar keselamatan data
--
-- Migrasi ini BOLEH dilaksanakan dengan selamat sementara ESP32 lama masih hidup:
-- ia TIDAK mengubah/membuang polisi anon sedia ada ("unit insert sensor data").
-- Penutupan pintu lama ada dalam supabase/manual/2_tutup_anon_insert.sql
-- dan hanya dijalankan SELEPAS firmware baharu disahkan berfungsi.
-- ============================================================================

-- 1) Jadual kelayakan peranti ------------------------------------------------
-- Satu kunci aktif bagi satu unit. Hanya hash SHA-256 disimpan; kunci sebenar
-- tidak boleh diperoleh semula (hanya dipaparkan sekali semasa dijana).
create table if not exists public.device_credentials (
  id           uuid primary key default gen_random_uuid(),
  unit_id      uuid not null references public.units(id) on delete cascade,
  key_hash     text not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  label        text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at   timestamptz
);

create unique index if not exists device_credentials_satu_aktif_per_unit
  on public.device_credentials (unit_id) where revoked_at is null;

comment on table public.device_credentials is
  'Kunci peranti ESP32 (hash sahaja) untuk Edge Function ingest. Hanya service_role/postgres boleh akses.';

alter table public.device_credentials enable row level security;
-- Sengaja TIADA polisi: pelanggan web (anon/authenticated) tak boleh baca atau tulis langsung.
revoke all on public.device_credentials from anon, authenticated;

-- Sejak 30 Okt 2026 Supabase tak lagi memberi grant automatik kepada jadual baharu dalam `public`.
-- Edge Function `ingest` guna service_role, jadi beri grant eksplisit supaya migrasi ini juga berfungsi
-- pada projek/branch/`supabase db reset` baharu. Sengaja TIADA grant untuk anon/authenticated.
grant select, insert, update, delete on public.device_credentials to service_role;

-- 2) Jana / putar kunci peranti ----------------------------------------------
-- Memulangkan kunci mentah SEKALI SAHAJA. Kunci lama unit itu dibatalkan serta-merta.
--
-- Dua lapis supaya semakan kebenaran mudah diaudit dan diuji:
--   _issue_device_key  : kerja sebenar, TANPA semakan kebenaran. Tiada siapa selain pemilik
--                        (postgres — cth. SQL editor) boleh memanggilnya.
--   rotate_device_key  : pembungkus dengan semakan — hanya admin (JWT) atau service_role.
create or replace function public._issue_device_key(p_unit_id uuid, p_label text default null)
returns text
language plpgsql
set search_path = public, extensions
as $$
declare
  v_key text;
begin
  if not exists (select 1 from public.units where id = p_unit_id) then
    raise exception 'unit tidak wujud' using errcode = 'P0002';
  end if;

  update public.device_credentials
     set revoked_at = now()
   where unit_id = p_unit_id and revoked_at is null;

  v_key := encode(gen_random_bytes(32), 'hex');   -- 64 aksara hex

  insert into public.device_credentials (unit_id, key_hash, label)
  values (p_unit_id, encode(digest(v_key, 'sha256'), 'hex'), p_label);

  return v_key;
end;
$$;

revoke all on function public._issue_device_key(uuid, text) from public, anon, authenticated, service_role;

create or replace function public.rotate_device_key(p_unit_id uuid, p_label text default null)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not (
       coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  ) then
    raise exception 'tidak dibenarkan' using errcode = '42501';
  end if;

  return public._issue_device_key(p_unit_id, p_label);
end;
$$;

revoke all on function public.rotate_device_key(uuid, text) from public, anon;
grant execute on function public.rotate_device_key(uuid, text) to authenticated, service_role;

-- 3) Pagar keselamatan pada data (berkuat kuasa juga pada laluan anon lama) ----
-- Semua baris sedia ada (288) dalam julat ini; nilai -1 ialah penanda "sensor gagal baca".
alter table public.sensor_data
  add constraint sensor_data_julat_chk check (
        (paras_air_pct   is null or paras_air_pct   between -1 and 100)
    and (paras_air_liter is null or paras_air_liter between -1 and 5000)
    and (solar_volt      is null or solar_volt      between  0 and 60)
    and (bateri_volt     is null or bateri_volt     between  0 and 60)
    and (bateri_pct      is null or bateri_pct      between  0 and 100)
  ) not valid;

alter table public.sensor_data validate constraint sensor_data_julat_chk;

-- 4) Indeks untuk semakan kadar (ingest) dan pertanyaan dashboard ---------------
create index if not exists sensor_data_unit_created_idx
  on public.sensor_data (unit_id, created_at desc);
