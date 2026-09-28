begin;

create table public.gallery_items (
 id uuid primary key default gen_random_uuid(), asset_id uuid not null unique references public.assets(id) on delete restrict,
 title text not null default '', caption text not null default '', alt_text text not null default '', location text not null default '', year text not null default '',
 sort_order integer not null check(sort_order between 0 and 10000), visible boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.puzzle_items (
 id uuid primary key default gen_random_uuid(), asset_id uuid not null unique references public.assets(id) on delete restrict,
 title text not null default '', alt_text text not null default '', sort_order integer not null check(sort_order between 0 and 10000), visible boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.collection_settings (id integer primary key check(id=1), version integer not null default 0, updated_at timestamptz not null default now());
insert into public.collection_settings values(1,0,now());
create table public.published_collections (id integer primary key check(id=1), snapshot jsonb not null, version integer not null, published_at timestamptz not null default now());

alter table public.gallery_items enable row level security;alter table public.puzzle_items enable row level security;alter table public.collection_settings enable row level security;alter table public.published_collections enable row level security;
revoke all on public.gallery_items,public.puzzle_items,public.collection_settings,public.published_collections from anon,authenticated;
grant select on public.gallery_items,public.puzzle_items,public.collection_settings to authenticated;grant select on public.published_collections to anon,authenticated;
create policy gallery_draft_read on public.gallery_items for select to authenticated using(public.is_archive_admin());
create policy puzzle_draft_read on public.puzzle_items for select to authenticated using(public.is_archive_admin());
create policy collection_settings_read on public.collection_settings for select to authenticated using(public.is_archive_admin());
create policy published_collections_read on public.published_collections for select using(true);

create or replace function public.protect_asset() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='DELETE' then
  if exists(select 1 from public.published_board where snapshot::text like '%' || old.id::text || '%') or exists(select 1 from public.published_collections where snapshot::text like '%' || old.id::text || '%') then raise exception 'Asset is referenced by published content'; end if;
  return old;
 end if;
 if old.approved and (new.storage_path is distinct from old.storage_path or new.thumbnail_path is distinct from old.thumbnail_path or not new.approved) then raise exception 'Approved files are immutable. Upload a replacement asset.'; end if;
 new.updated_at=now(); return new;
end $$;

create function public.validate_archive_collections(value jsonb) returns void language plpgsql set search_path='' as $$
declare item jsonb;kind text;
begin
 if jsonb_typeof(value->'gallery') is distinct from 'array' or jsonb_typeof(value->'puzzle') is distinct from 'array' or jsonb_array_length(value->'gallery')>200 or jsonb_array_length(value->'puzzle')>100 then raise exception 'Invalid collection snapshot'; end if;
 foreach kind in array array['gallery','puzzle'] loop
  for item in select * from jsonb_array_elements(value->kind) loop
   if coalesce(item->>'id','')='' or coalesce(item->>'asset_id','')='' or jsonb_typeof(item->'sort_order') is distinct from 'number' or jsonb_typeof(item->'visible') is distinct from 'boolean' then raise exception 'Invalid collection item'; end if;
  end loop;
 end loop;
end $$;

create function public.save_archive_collections(value jsonb,expected_version integer) returns integer language plpgsql security definer set search_path='' as $$
declare current_version integer;item jsonb;
begin
 if not public.is_archive_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 select version into current_version from public.collection_settings where id=1 for update;
 if current_version<>expected_version then raise exception 'Collections changed in another tab. Reload before saving.'; end if;
 perform public.validate_archive_collections(value);
 delete from public.gallery_items where id is not null;delete from public.puzzle_items where id is not null;
 for item in select * from jsonb_array_elements(value->'gallery') loop insert into public.gallery_items(id,asset_id,title,caption,alt_text,location,year,sort_order,visible) values((item->>'id')::uuid,(item->>'asset_id')::uuid,item->>'title',item->>'caption',item->>'alt_text',item->>'location',item->>'year',(item->>'sort_order')::integer,(item->>'visible')::boolean);end loop;
 for item in select * from jsonb_array_elements(value->'puzzle') loop insert into public.puzzle_items(id,asset_id,title,alt_text,sort_order,visible) values((item->>'id')::uuid,(item->>'asset_id')::uuid,item->>'title',item->>'alt_text',(item->>'sort_order')::integer,(item->>'visible')::boolean);end loop;
 update public.collection_settings set version=version+1,updated_at=now() where id=1;return current_version+1;
end $$;

create function public.publish_archive_collections(expected_version integer) returns timestamptz language plpgsql security definer set search_path='' as $$
declare current_version integer;snapshot jsonb;published_time timestamptz=now();
begin
 if not public.is_archive_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 select version into current_version from public.collection_settings where id=1 for update;if current_version<>expected_version then raise exception 'Collections changed. Reload before publishing.'; end if;
 if exists(select 1 from public.gallery_items i join public.assets a on a.id=i.asset_id where not a.approved or a.mime_type not like 'image/%') or exists(select 1 from public.puzzle_items i join public.assets a on a.id=i.asset_id where not a.approved or a.mime_type not like 'image/%') then raise exception 'Collections require approved image assets';end if;
 select jsonb_build_object(
  'gallery',(select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'asset_id',i.asset_id,'title',i.title,'caption',i.caption,'alt_text',i.alt_text,'location',i.location,'year',i.year,'sort_order',i.sort_order,'visible',i.visible,'storage_path',a.storage_path) order by i.sort_order),'[]') from public.gallery_items i join public.assets a on a.id=i.asset_id),
  'puzzle',(select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'asset_id',i.asset_id,'title',i.title,'alt_text',i.alt_text,'sort_order',i.sort_order,'visible',i.visible,'storage_path',a.storage_path) order by i.sort_order),'[]') from public.puzzle_items i join public.assets a on a.id=i.asset_id)
 ) into snapshot;
 perform public.validate_archive_collections(snapshot);
 insert into public.published_collections values(1,snapshot,current_version,published_time) on conflict(id) do update set snapshot=excluded.snapshot,version=excluded.version,published_at=excluded.published_at;return published_time;
end $$;

revoke all on function public.validate_archive_collections(jsonb),public.save_archive_collections(jsonb,integer),public.publish_archive_collections(integer) from public;
grant execute on function public.save_archive_collections(jsonb,integer),public.publish_archive_collections(integer) to authenticated;
commit;
