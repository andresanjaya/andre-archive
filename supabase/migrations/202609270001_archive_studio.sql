-- Run once in Supabase SQL Editor, or apply via supabase db push.
begin;
create table public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create policy own_admin_membership on public.admin_users for select to authenticated using (user_id = auth.uid());
create function public.is_archive_admin() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.admin_users where user_id = auth.uid()); $$;
revoke all on function public.is_archive_admin() from public;
grant execute on function public.is_archive_admin() to anon, authenticated;

create table public.assets (
 id uuid primary key default gen_random_uuid(), name text not null, category text not null default 'other',
 storage_path text not null unique, thumbnail_path text, mime_type text not null check(mime_type in ('image/png','image/jpeg','image/webp','audio/mpeg')),
 file_size bigint not null check(file_size between 1 and 20971520), width integer check(width between 1 and 16000), height integer check(height between 1 and 16000),
 alt_text text not null default '', approved boolean not null default false, source_path text unique,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.artifacts (
 id text primary key, key text not null unique, name text not null, type text not null,
 asset_id uuid references public.assets(id) on delete restrict,
 content jsonb not null default '{}', x double precision not null, y double precision not null, width double precision not null, height double precision,
 rotate double precision not null, z integer not null, visible boolean not null, locked boolean not null,
 animation text not null, action text not null, config jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.archive_settings (id integer primary key check(id=1), settings jsonb not null, version integer not null default 0, updated_at timestamptz not null default now());
insert into public.archive_settings values(1,'{"background":"#1f6b50","grid":true,"entrance":true,"initialX":0,"initialY":0}',0,now());
create table public.published_board (id integer primary key check(id=1), snapshot jsonb not null, published_at timestamptz not null default now(), version integer not null);

alter table public.assets enable row level security;
alter table public.artifacts enable row level security;
alter table public.archive_settings enable row level security;
alter table public.published_board enable row level security;
revoke all on public.assets, public.artifacts, public.archive_settings, public.published_board from anon, authenticated;
grant select on public.assets, public.published_board to anon, authenticated;
grant select on public.artifacts, public.archive_settings to authenticated;
grant insert, update, delete on public.assets to authenticated;
create policy assets_read on public.assets for select using (approved or public.is_archive_admin());
create policy assets_insert on public.assets for insert to authenticated with check(public.is_archive_admin());
create policy assets_update on public.assets for update to authenticated using(public.is_archive_admin()) with check(public.is_archive_admin());
create policy assets_delete on public.assets for delete to authenticated using(public.is_archive_admin());
create policy draft_read on public.artifacts for select to authenticated using(public.is_archive_admin());
create policy settings_read on public.archive_settings for select to authenticated using(public.is_archive_admin());
create policy published_read on public.published_board for select using(true);

create function public.protect_asset() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='DELETE' then
  if exists(select 1 from public.published_board where snapshot::text like '%' || old.id::text || '%') then raise exception 'Asset is referenced by the published board'; end if;
  return old;
 end if;
 if old.approved and (new.storage_path is distinct from old.storage_path or new.thumbnail_path is distinct from old.thumbnail_path or not new.approved) then raise exception 'Approved files are immutable. Upload a replacement asset.'; end if;
 new.updated_at=now(); return new;
end $$;
create trigger protect_asset before update or delete on public.assets for each row execute function public.protect_asset();

-- Private originals/variants. Public bucket contains explicitly approved, immutable media only.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('archive-drafts','archive-drafts',false,20971520,array['image/png','image/jpeg','image/webp','audio/mpeg']),
 ('archive-public','archive-public',true,20971520,array['image/png','image/jpeg','image/webp','audio/mpeg']);
create policy archive_private_read on storage.objects for select to authenticated using(bucket_id in ('archive-drafts','archive-public') and public.is_archive_admin());
create policy archive_upload on storage.objects for insert to authenticated with check(bucket_id in ('archive-drafts','archive-public') and public.is_archive_admin());
-- No UPDATE policy: paths are immutable. Delete only files not referenced by asset metadata.
create policy archive_delete_unused on storage.objects for delete to authenticated using(
 bucket_id in ('archive-drafts','archive-public') and public.is_archive_admin()
 and not exists(select 1 from public.assets a where a.storage_path=storage.objects.name or a.thumbnail_path=storage.objects.name)
);

create function public.validate_archive_board(board jsonb) returns void language plpgsql set search_path='' as $$
declare a jsonb; s jsonb; fields text[]; animations text[]; actions text[]; k text; v jsonb;
begin
 if jsonb_typeof(board->'artifacts') is distinct from 'array' or jsonb_array_length(board->'artifacts')>300 then raise exception 'Invalid artifacts'; end if;
 if exists(select 1 from jsonb_array_elements(board->'artifacts') t group by t->>'id' having count(*)>1) or exists(select 1 from jsonb_array_elements(board->'artifacts') t group by t->>'key' having count(*)>1) then raise exception 'Duplicate identity'; end if;
 for a in select * from jsonb_array_elements(board->'artifacts') loop
  case a->>'type'
   when 'identity' then fields=array['image','intro']; animations=array['none']; actions=array['none'];
   when 'book' then fields=array['image','alt','color']; animations=array['book-3d','none']; actions=array['disturb','none','sound'];
   when 'cinema' then fields=array['image','alt']; animations=array['projector','none']; actions=array['sound','none'];
   when 'polaroid' then fields=array['image','caption','year','location','fit','focus']; animations=array['lift','none']; actions=array['none','sound'];
   when 'music' then fields=array['image','trackId','title','artist','audio']; animations=array['lift','none']; actions=array['play-music','none'];
   when 'sticker' then fields=array['image','discovery','sound']; animations=array['lift','none']; actions=array['discover','none','sound'];
   when 'pokemon' then fields=array['image','variant','discovery']; animations=array['lift','none']; actions=array['discover','sound','none'];
   when 'marvel' then fields=array['image']; animations=array['lift','none']; actions=array['none'];
   when 'stamp' then fields=array['image']; animations=array['lift','none']; actions=array['none'];
   when 'decoration' then fields=array['image','alt','sound']; animations=array['lift','none']; actions=array['none','sound','disturb'];
   when 'secret' then fields=array['title','description']; animations=array['lift','none']; actions=array['none'];
   when 'tiny-pixel' then fields=array[]::text[]; animations=array['none']; actions=array['none'];
   when 'puzzle' then fields=array['image']; animations=array['lift','none']; actions=array['open-puzzle','none'];
   else raise exception 'Unsupported artifact type';
  end case;
  if coalesce(a->>'id','')='' or coalesce(a->>'key','')='' or a->>'name' is null or coalesce(not(a->>'animation'=any(animations)),true) or coalesce(not(a->>'action'=any(actions)),true) then raise exception 'Unsupported interaction or identity'; end if;
  foreach k in array array['x','y','width','rotate','z'] loop
   if jsonb_typeof(a->k) is distinct from 'number' then raise exception 'Invalid number'; end if;
  end loop;
  if abs((a->>'x')::numeric)>10000 or abs((a->>'y')::numeric)>10000 or (a->>'width')::numeric not between 24 and 2000 or abs((a->>'rotate')::numeric)>360 or (a->>'z')::numeric not between 0 and 1000 then raise exception 'Invalid layout'; end if;
  if a->'height' is distinct from 'null'::jsonb and (jsonb_typeof(a->'height') is distinct from 'number' or (a->>'height')::numeric not between 24 and 2000) then raise exception 'Invalid height'; end if;
  if jsonb_typeof(a->'visible') is distinct from 'boolean' or jsonb_typeof(a->'locked') is distinct from 'boolean' or jsonb_typeof(a->'content') is distinct from 'object' or jsonb_typeof(a->'config') is distinct from 'object' then raise exception 'Invalid content'; end if;
  for k,v in select * from jsonb_each(a->'content') loop
   if not(k=any(fields)) or jsonb_typeof(v)<>'string' or length(v::text)>10002 then raise exception 'Unknown content field'; end if;
   if k in ('image','audio') and a->'content'->>k <> '' and a->'content'->>k !~ '^(/archive/|https://)' then raise exception 'Invalid media URL'; end if;
  end loop;
  for k,v in select * from jsonb_each(a->'config') loop
   if k not in ('duration','lift') or jsonb_typeof(v)<>'number' then raise exception 'Invalid animation configuration'; end if;
   if (k='duration' and v::text::numeric not between 100 and 2000) or (k='lift' and v::text::numeric not between 0 and 30) then raise exception 'Animation out of range'; end if;
  end loop;
 end loop;
 s=board->'settings';
 if coalesce(s->>'background','') !~ '^#[a-fA-F0-9]{6}$' or jsonb_typeof(s->'grid') is distinct from 'boolean' or jsonb_typeof(s->'entrance') is distinct from 'boolean' then raise exception 'Invalid settings'; end if;
 foreach k in array array['initialX','initialY'] loop
  if jsonb_typeof(s->k) is distinct from 'number' or abs((s->>k)::numeric)>10000 then raise exception 'Invalid initial position'; end if;
 end loop;
end $$;

create function public.save_archive_draft(board jsonb, expected_version integer) returns integer language plpgsql security definer set search_path='' as $$
declare current_version integer; a jsonb;
begin
 if not public.is_archive_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 select version into current_version from public.archive_settings where id=1 for update;
 if current_version<>expected_version then raise exception 'Draft changed in another tab. Reload before saving.'; end if;
 perform public.validate_archive_board(board);
 -- Supabase's safe-update guard rejects DELETE statements without an explicit
 -- predicate, even inside this trusted RPC. Every row has a non-null PK, so
 -- this remains a full draft replacement while satisfying that guard.
 delete from public.artifacts where id is not null;
 for a in select * from jsonb_array_elements(board->'artifacts') loop
  insert into public.artifacts(id,key,name,type,asset_id,content,x,y,width,height,rotate,z,visible,locked,animation,action,config)
  values(a->>'id',a->>'key',a->>'name',a->>'type',nullif(a->>'asset_id','')::uuid,a->'content',(a->>'x')::float8,(a->>'y')::float8,(a->>'width')::float8,(a->>'height')::float8,(a->>'rotate')::float8,(a->>'z')::integer,(a->>'visible')::boolean,(a->>'locked')::boolean,a->>'animation',a->>'action',a->'config');
 end loop;
 update public.archive_settings set settings=board->'settings',version=version+1,updated_at=now() where id=1;
 return current_version+1;
end $$;

create function public.publish_archive(expected_version integer) returns timestamptz language plpgsql security definer set search_path='' as $$
declare s public.archive_settings; snapshot jsonb; published_time timestamptz=now();
begin
 if not public.is_archive_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into s from public.archive_settings where id=1 for update;
 if s.version<>expected_version then raise exception 'Draft changed. Reload before publishing.'; end if;
 -- Lock asset metadata through the transaction so concurrent delete/revoke cannot race publishing.
 perform 1 from public.assets where id in (select asset_id from public.artifacts) for share;
 if exists(select 1 from public.assets m where not m.approved and exists(select 1 from public.artifacts a where a.asset_id=m.id or a.content::text like '%' || m.id::text || '%')) then raise exception 'Approve referenced assets before publishing'; end if;
 select jsonb_build_object('settings',s.settings,'artifacts',coalesce(jsonb_agg(to_jsonb(a)-'created_at'-'updated_at' order by a.z,a.key),'[]')) into snapshot from public.artifacts a;
 perform public.validate_archive_board(snapshot);
 insert into public.published_board values(1,snapshot,published_time,s.version) on conflict(id) do update set snapshot=excluded.snapshot,published_at=excluded.published_at,version=excluded.version;
 return published_time;
end $$;
revoke all on function public.validate_archive_board(jsonb),public.save_archive_draft(jsonb,integer),public.publish_archive(integer) from public;
grant execute on function public.save_archive_draft(jsonb,integer),public.publish_archive(integer) to authenticated;
commit;
