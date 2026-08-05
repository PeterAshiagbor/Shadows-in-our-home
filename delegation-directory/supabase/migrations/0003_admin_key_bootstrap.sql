-- Admin key bootstrap.
--
-- 0001 creates app_config empty, but the admin edge function only authorises a
-- request when an 'admin_key_hash' row exists. On a fresh or reset project that
-- makes /admin permanently 401 with nothing to indicate why, and there was no
-- documented step to fix it.
--
-- This adds the missing step as a function rather than a seeded value, so the
-- plaintext key is never committed to the repository. The hash format matches
-- what the edge function computes: lowercase hex SHA-256 of the UTF-8 key.
--
-- Run once per project, in the SQL editor, with a key you generate yourself:
--
--     select public.set_admin_key('<the admin key>');
--
-- Rotating the key is the same call again — it overwrites the existing hash.

create or replace function public.set_admin_key(new_key text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.app_config (key, value)
  values ('admin_key_hash', encode(sha256(convert_to(new_key, 'UTF8')), 'hex'))
  on conflict (key) do update set value = excluded.value;
$$;

comment on function public.set_admin_key(text) is
  'Sets/rotates the /admin key. Stores only a SHA-256 hash in app_config. '
  'Owner-only: never granted to anon or authenticated.';

-- The function is SECURITY DEFINER, so execute rights must be locked down to
-- the owner. Anything reachable by the anon key could otherwise reset the key.
revoke all on function public.set_admin_key(text) from public;
revoke all on function public.set_admin_key(text) from anon, authenticated;
