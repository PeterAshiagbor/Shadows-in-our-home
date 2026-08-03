-- GEN UK Delegation Directory — schema
-- Delegate PII (email, claim_token) is never exposed publicly: the anon role
-- can only read the public_delegates view, which excludes those columns and
-- withholds delegate-supplied content until consent_public is true.

create table public.delegates (
  id            uuid primary key default gen_random_uuid(),
  cohort        text not null default 'gec-2025',
  slug          text not null unique,
  first_name    text not null,
  last_name     text not null,
  role          text,
  organisation  text,
  linkedin_url  text,
  category      text,

  -- delegate-supplied
  photo_path    text,
  summary       text check (char_length(summary) <= 300),
  looking_for   text check (char_length(looking_for) <= 300),
  can_help_with text check (char_length(can_help_with) <= 300),

  -- claim + consent
  email         text,
  claim_token   uuid not null default gen_random_uuid(),
  claim_status  text not null default 'unclaimed'
                check (claim_status in ('unclaimed','claimed','published')),
  claimed_at    timestamptz,
  consent_public boolean not null default false,
  consent_at    timestamptz,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.delegates enable row level security;
revoke all on table public.delegates from anon, authenticated;

create function public.set_updated_at()
returns trigger language plpgsql
set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger delegates_updated_at
before update on public.delegates
for each row execute function public.set_updated_at();

-- Security-definer view is intentional: it is the only public read surface.
-- Basic handbook fields (already distributed by GEN) show for every delegate;
-- delegate-supplied fields only surface once consent_public is set.
create view public.public_delegates as
select
  id, cohort, slug, first_name, last_name, role, organisation, linkedin_url, category,
  case when consent_public then photo_path    end as photo_path,
  case when consent_public then summary       end as summary,
  case when consent_public then looking_for   end as looking_for,
  case when consent_public then can_help_with end as can_help_with,
  claim_status
from public.delegates;

grant select on public.public_delegates to anon, authenticated;

-- Locked config table; only service role (edge functions) can read.
create table public.app_config (
  key   text primary key,
  value text not null
);
alter table public.app_config enable row level security;
revoke all on table public.app_config from anon, authenticated;

-- Public-read photo bucket; writes happen only via the service role in edge functions.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('delegate-photos', 'delegate-photos', true, 5242880, array['image/jpeg','image/png','image/webp']);
