-- rahul-dev initial schema — blueprint §9.
-- Apply via `supabase db push` after `supabase link`.
-- Every table uses RLS; anonymous reads are only allowed where the blueprint
-- explicitly calls for public access (published content, page view writes).

--
-- Extensions
--
create extension if not exists pgcrypto;

--
-- projects
--
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  description   text,
  content       text,
  tech_tags     text[],
  image_url     text,
  live_url      text,
  github_url    text,
  is_featured   boolean not null default false,
  sort_order    int not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists projects_sort_idx   on public.projects (sort_order);
create index if not exists projects_slug_idx   on public.projects (slug);

alter table public.projects enable row level security;

create policy "projects read published (anon)"
  on public.projects for select
  to anon
  using (is_published = true);

create policy "projects full access (authenticated)"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

--
-- feed_items
--
create table if not exists public.feed_items (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('blog','link','update','note','article')),
  title         text not null,
  content       text,
  url           text,
  tags          text[],
  image_url     text,
  is_published  boolean not null default true,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists feed_items_published_at_idx on public.feed_items (published_at desc);
create index if not exists feed_items_type_idx         on public.feed_items (type);

alter table public.feed_items enable row level security;

create policy "feed read published (anon)"
  on public.feed_items for select
  to anon
  using (is_published = true);

create policy "feed full access (authenticated)"
  on public.feed_items for all
  to authenticated
  using (true)
  with check (true);

--
-- contact_messages
--
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

create policy "contact insert (anon)"
  on public.contact_messages for insert
  to anon
  with check (true);

create policy "contact read/update/delete (authenticated)"
  on public.contact_messages for all
  to authenticated
  using (true)
  with check (true);

--
-- page_views (expanded per blueprint §5.7)
--
create table if not exists public.page_views (
  id                  bigint generated always as identity primary key,
  path                text not null,
  referrer            text,
  user_agent          text,
  device_type         text check (device_type in ('desktop','mobile','tablet')),
  browser             text,
  browser_version     text,
  os                  text,
  screen_width        int,
  screen_height       int,
  country             text,
  city                text,
  language            text,
  timezone            text,
  visitor_hash        text,
  session_duration_ms int,
  is_bot              boolean not null default false,
  created_at          timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx       on public.page_views (path);
create index if not exists page_views_hash_idx       on public.page_views (visitor_hash);

alter table public.page_views enable row level security;

create policy "page_views insert (anon)"
  on public.page_views for insert
  to anon
  with check (true);

create policy "page_views read (authenticated)"
  on public.page_views for select
  to authenticated
  using (true);

--
-- visitor_salt (Phase 11.1 — single-row daily-rotated salt)
--
create table if not exists public.visitor_salt (
  id          int primary key default 1,
  salt        text not null,
  rotated_at  timestamptz not null default now(),
  constraint visitor_salt_singleton check (id = 1)
);

alter table public.visitor_salt enable row level security;

-- No anon access. A Supabase Edge Function (service role) will rotate this
-- daily and a Supabase Edge Function serves the current salt to the
-- client-side tracker. Until that's wired, the client rotates its own
-- localStorage salt — documented on /privacy.
create policy "visitor_salt read (authenticated)"
  on public.visitor_salt for select
  to authenticated
  using (true);

--
-- site_settings
--
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "settings read (anon)"
  on public.site_settings for select
  to anon
  using (true);

create policy "settings write (authenticated)"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);
