-- Voces del Sur · Esquema de base de datos (Supabase / PostgreSQL)
-- Pegar completo en: Supabase > SQL Editor > New query > Run

create table if not exists public.respuestas (
  id uuid primary key default gen_random_uuid(),
  creado_en timestamptz not null default now(),
  nacio_rg boolean not null,
  origen text check (char_length(origen) <= 80),
  edad_llegada text,
  trajeron_de_chico text,
  motivo_llegada text,
  anios_en_ciudad text,
  gusta_ciudad smallint check (gusta_ciudad between 1 and 5),
  lo_mejor text[],
  lo_peor text[],
  se_siente_riogalleguense smallint check (se_siente_riogalleguense between 1 and 5),
  futuro text,
  grupo_edad text,
  comentario text check (char_length(comentario) <= 500)
);

-- Seguridad: el público solo puede INSERTAR. Nadie puede leer filas sueltas.
alter table public.respuestas enable row level security;

drop policy if exists "insertar_publico" on public.respuestas;
create policy "insertar_publico" on public.respuestas
  for insert to anon with check (true);

-- Función interna: conteo por columna (solo columnas permitidas)
create or replace function public._conteo(col text, es_array boolean default false)
returns json language plpgsql security definer set search_path = public as $$
declare r json;
begin
  if col not in ('motivo_llegada','edad_llegada','trajeron_de_chico','futuro',
                 'grupo_edad','anios_en_ciudad','lo_mejor','lo_peor') then
    raise exception 'columna no permitida';
  end if;
  if es_array then
    execute format('select coalesce(json_object_agg(k,c),''{}''::json) from
      (select unnest(%I) as k, count(*) as c from respuestas group by 1) t', col) into r;
  else
    execute format('select coalesce(json_object_agg(k,c),''{}''::json) from
      (select %I as k, count(*) as c from respuestas where %I is not null group by 1) t', col, col) into r;
  end if;
  return r;
end $$;
revoke execute on function public._conteo(text, boolean) from public, anon, authenticated;

-- Función pública: solo devuelve datos agregados (sin respuestas individuales)
create or replace function public.get_resumen()
returns json language sql security definer set search_path = public as $$
  select json_build_object(
    'total',        (select count(*) from respuestas),
    'nacidos',      (select count(*) from respuestas where nacio_rg),
    'venidos',      (select count(*) from respuestas where not nacio_rg),
    'gusta_nacidos',(select round(avg(gusta_ciudad)::numeric,2) from respuestas where nacio_rg),
    'gusta_venidos',(select round(avg(gusta_ciudad)::numeric,2) from respuestas where not nacio_rg),
    'riogall_nacidos',(select round(avg(se_siente_riogalleguense)::numeric,2) from respuestas where nacio_rg),
    'riogall_venidos',(select round(avg(se_siente_riogalleguense)::numeric,2) from respuestas where not nacio_rg),
    'motivo_llegada',   _conteo('motivo_llegada'),
    'edad_llegada',     _conteo('edad_llegada'),
    'trajeron_de_chico',_conteo('trajeron_de_chico'),
    'anios_en_ciudad',  _conteo('anios_en_ciudad'),
    'futuro',           _conteo('futuro'),
    'grupo_edad',       _conteo('grupo_edad'),
    'lo_mejor',         _conteo('lo_mejor', true),
    'lo_peor',          _conteo('lo_peor', true)
  );
$$;
grant execute on function public.get_resumen() to anon;
