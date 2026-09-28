begin;

-- Hotfix for projects that already ran 202609270001_archive_studio.sql.
-- Supabase's safe-update guard rejects a DELETE without an explicit predicate.
create or replace function public.save_archive_draft(board jsonb, expected_version integer)
returns integer
language plpgsql
security definer
set search_path=''
as $$
declare current_version integer; a jsonb;
begin
 if not public.is_archive_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 select version into current_version from public.archive_settings where id=1 for update;
 if current_version<>expected_version then raise exception 'Draft changed in another tab. Reload before saving.'; end if;
 perform public.validate_archive_board(board);
 delete from public.artifacts where id is not null;
 for a in select * from jsonb_array_elements(board->'artifacts') loop
  insert into public.artifacts(id,key,name,type,asset_id,content,x,y,width,height,rotate,z,visible,locked,animation,action,config)
  values(a->>'id',a->>'key',a->>'name',a->>'type',nullif(a->>'asset_id','')::uuid,a->'content',(a->>'x')::float8,(a->>'y')::float8,(a->>'width')::float8,(a->>'height')::float8,(a->>'rotate')::float8,(a->>'z')::integer,(a->>'visible')::boolean,(a->>'locked')::boolean,a->>'animation',a->>'action',a->'config');
 end loop;
 update public.archive_settings set settings=board->'settings',version=version+1,updated_at=now() where id=1;
 return current_version+1;
end $$;

revoke all on function public.save_archive_draft(jsonb,integer) from public;
grant execute on function public.save_archive_draft(jsonb,integer) to authenticated;

commit;
