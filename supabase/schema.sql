-- Hombro Seguro — esquema del backend (Supabase / Postgres)
-- Seguridad: RLS en todas las tablas — cada usuario solo ve y escribe sus propias filas.

-- ─── Perfiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Crear el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Estado de la app (sincronización clave/valor) ──────────────────────────
-- Espeja el localStorage de la PWA: series marcadas, pesos, semáforo, preferencias.
create table if not exists public.kv_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  k text not null,
  v jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, k)
);
alter table public.kv_state enable row level security;

drop policy if exists "own kv" on public.kv_state;
create policy "own kv" on public.kv_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Actividades Garmin ──────────────────────────────────────────────────────
-- Alimentada por garmintool.py (clave de servicio) o por la propia app.
create table if not exists public.garmin_activities (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id bigint not null,
  start_time timestamptz,
  type text,
  name text,
  distance_km numeric,
  duration_min numeric,
  pace text,
  hr_avg int,
  hr_max int,
  elevation_m int,
  calories int,
  cadence numeric,
  raw jsonb,
  primary key (user_id, activity_id)
);
alter table public.garmin_activities enable row level security;

drop policy if exists "own activities" on public.garmin_activities;
create policy "own activities" on public.garmin_activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists garmin_activities_time_idx
  on public.garmin_activities (user_id, start_time desc);
