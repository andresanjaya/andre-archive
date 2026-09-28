begin;

-- Card faces live in the existing JSON payload, so historic artifact rows and
-- published snapshots remain compatible. This replaces only the validation
-- function, which is the supported extension point for a new artifact type.
create or replace function public.validate_archive_board(board jsonb) returns void language plpgsql set search_path='' as $$
declare a jsonb; s jsonb; fields text[]; animations text[]; actions text[]; k text; v jsonb;
begin
 if jsonb_typeof(board->'artifacts') is distinct from 'array' or jsonb_array_length(board->'artifacts')>300 then raise exception 'Invalid artifacts'; end if;
 if exists(select 1 from jsonb_array_elements(board->'artifacts') t group by t->>'id' having count(*)>1) or exists(select 1 from jsonb_array_elements(board->'artifacts') t group by t->>'key' having count(*)>1) then raise exception 'Duplicate identity'; end if;
 for a in select * from jsonb_array_elements(board->'artifacts') loop
  case a->>'type'
   when 'identity' then fields=array['image','intro']; animations=array['none']; actions=array['none'];
   when 'book' then fields=array['image','alt','color']; animations=array['book-3d','none']; actions=array['disturb','none','sound'];
   when 'card' then fields=array['front_asset_id','back_asset_id','front_image','back_image','front_alt','back_alt']; animations=array['none']; actions=array['flip-card'];
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
  foreach k in array array['x','y','width','rotate','z'] loop if jsonb_typeof(a->k) is distinct from 'number' then raise exception 'Invalid number'; end if; end loop;
  if abs((a->>'x')::numeric)>10000 or abs((a->>'y')::numeric)>10000 or (a->>'width')::numeric not between 24 and 2000 or abs((a->>'rotate')::numeric)>360 or (a->>'z')::numeric not between 0 and 1000 then raise exception 'Invalid layout'; end if;
  if a->'height' is distinct from 'null'::jsonb and (jsonb_typeof(a->'height') is distinct from 'number' or (a->>'height')::numeric not between 24 and 2000) then raise exception 'Invalid height'; end if;
  if jsonb_typeof(a->'visible') is distinct from 'boolean' or jsonb_typeof(a->'locked') is distinct from 'boolean' or jsonb_typeof(a->'content') is distinct from 'object' or jsonb_typeof(a->'config') is distinct from 'object' then raise exception 'Invalid content'; end if;
  for k,v in select * from jsonb_each(a->'content') loop
   if not(k=any(fields)) or jsonb_typeof(v)<>'string' or length(v::text)>10002 then raise exception 'Unknown content field'; end if;
   if k in ('image','audio','front_image','back_image') and a->'content'->>k <> '' and a->'content'->>k !~ '^(/archive/|https://)' then raise exception 'Invalid media URL'; end if;
  end loop;
  if a->>'type'='card' and (coalesce(a->'content'->>'front_asset_id','')='' or coalesce(a->'content'->>'back_asset_id','')='' or coalesce(a->'content'->>'front_image','')='' or coalesce(a->'content'->>'back_image','')='') then raise exception 'Card requires front and back assets'; end if;
  for k,v in select * from jsonb_each(a->'config') loop
   if k not in ('duration','lift') or jsonb_typeof(v)<>'number' then raise exception 'Invalid animation configuration'; end if;
   if (k='duration' and v::text::numeric not between 100 and 2000) or (k='lift' and v::text::numeric not between 0 and 30) then raise exception 'Animation out of range'; end if;
  end loop;
 end loop;
 s=board->'settings';
 if coalesce(s->>'background','') !~ '^#[a-fA-F0-9]{6}$' or jsonb_typeof(s->'grid') is distinct from 'boolean' or jsonb_typeof(s->'entrance') is distinct from 'boolean' then raise exception 'Invalid settings'; end if;
 foreach k in array array['initialX','initialY'] loop if jsonb_typeof(s->k) is distinct from 'number' or abs((s->>k)::numeric)>10000 then raise exception 'Invalid initial position'; end if; end loop;
end $$;

-- `back_asset_id` is deliberately stored in the JSON payload to preserve the
-- established artifact schema. Guard draft references as well as published
-- snapshots, so a card cannot retain a deleted back face.
create or replace function public.protect_asset() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='DELETE' then
  if exists(select 1 from public.published_board where snapshot::text like '%' || old.id::text || '%') or exists(select 1 from public.artifacts where content::text like '%' || old.id::text || '%') then raise exception 'Asset is referenced by the board'; end if;
  return old;
 end if;
 if old.approved and (new.storage_path is distinct from old.storage_path or new.thumbnail_path is distinct from old.thumbnail_path or not new.approved) then raise exception 'Approved files are immutable. Upload a replacement asset.'; end if;
 new.updated_at=now(); return new;
end $$;

commit;
