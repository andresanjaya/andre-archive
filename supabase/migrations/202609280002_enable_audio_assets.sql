begin;

-- Hotfix for existing Andre Archive Studio projects: allow MP3 media records.
alter table public.assets drop constraint if exists assets_mime_type_check;
alter table public.assets add constraint assets_mime_type_check check (mime_type in ('image/png','image/jpeg','image/webp','audio/mpeg'));
alter table public.assets alter column thumbnail_path drop not null;
alter table public.assets alter column width drop not null;
alter table public.assets alter column height drop not null;

update storage.buckets
set allowed_mime_types=array['image/png','image/jpeg','image/webp','audio/mpeg']
where id in ('archive-drafts','archive-public');

create or replace function public.protect_asset() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='DELETE' then
  if exists(select 1 from public.published_board where snapshot::text like '%' || old.id::text || '%') then raise exception 'Asset is referenced by the published board'; end if;
  return old;
 end if;
 if old.approved and (new.storage_path is distinct from old.storage_path or new.thumbnail_path is distinct from old.thumbnail_path or not new.approved) then raise exception 'Approved files are immutable. Upload a replacement asset.'; end if;
 new.updated_at=now(); return new;
end $$;

create or replace function public.publish_archive(expected_version integer) returns timestamptz language plpgsql security definer set search_path='' as $$
declare s public.archive_settings; snapshot jsonb; published_time timestamptz=now();
begin
 if not public.is_archive_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into s from public.archive_settings where id=1 for update;
 if s.version<>expected_version then raise exception 'Draft changed. Reload before publishing.'; end if;
 if exists(select 1 from public.assets m where not m.approved and exists(select 1 from public.artifacts a where a.asset_id=m.id or a.content::text like '%' || m.id::text || '%')) then raise exception 'Approve referenced assets before publishing'; end if;
 select jsonb_build_object('settings',s.settings,'artifacts',coalesce(jsonb_agg(to_jsonb(a)-'created_at'-'updated_at' order by a.z,a.key),'[]')) into snapshot from public.artifacts a;
 perform public.validate_archive_board(snapshot);
 insert into public.published_board values(1,snapshot,published_time,s.version) on conflict(id) do update set snapshot=excluded.snapshot,published_at=excluded.published_at,version=excluded.version;
 return published_time;
end $$;

commit;
