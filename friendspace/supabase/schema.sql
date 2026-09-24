-- FriendSpace database schema
-- Run this once in Supabase → SQL Editor.
-- Assumes Supabase Auth is enabled (auth.users already exists).

-- 1. Profiles ---------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  university text,
  bio text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up via Google
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Albums & photos (the retro digital album) -------------------------
create table albums (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  theme text default 'retro', -- e.g. 'retro', 'polaroid', 'film-strip'
  cover_photo_url text,
  created_at timestamptz not null default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references albums(id) on delete cascade,
  uploader_id uuid not null references profiles(id) on delete cascade,
  url text not null,
  caption text,
  taken_at date,
  location text,
  created_at timestamptz not null default now()
);

-- 3. Photo dumps (weekly / monthly) -------------------------------------
create table dumps (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('weekly', 'monthly')),
  title text not null,
  period_start date not null,
  period_end date not null,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table dump_photos (
  dump_id uuid references dumps(id) on delete cascade,
  photo_id uuid references photos(id) on delete cascade,
  primary key (dump_id, photo_id)
);

-- 4. Challenges (colour-hunting, and any future photo challenge) --------
create table challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'color-hunt', -- extensible: 'color-hunt', 'scavenger', etc.
  prompt text not null, -- e.g. "Find something teal"
  color_hex text, -- for color-hunt challenges
  start_date date not null,
  end_date date not null,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  photo_url text not null,
  caption text,
  created_at timestamptz not null default now(),
  unique (challenge_id, user_id) -- one submission per person per challenge
);

-- 5. Trends (uni-routine style templates, TikTok-trend photo dumps) -----
create table trends (
  id uuid primary key default gen_random_uuid(),
  title text not null, -- e.g. "A day in my uni life"
  description text,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table trend_entries (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid not null references trends(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  media_url text not null, -- photo or short video
  caption text,
  created_at timestamptz not null default now()
);

-- 6. Meetups & video calls ------------------------------------------------
create table meetups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null check (kind in ('in_person', 'video_call')),
  starts_at timestamptz not null,
  location_or_link text,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table meetup_rsvps (
  meetup_id uuid references meetups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  status text not null default 'going' check (status in ('going', 'maybe', 'cant_go')),
  primary key (meetup_id, user_id)
);

-- 7. Comments & reactions (generic, works on any content type) ---------
create table comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null, -- 'photo' | 'dump' | 'challenge_submission' | 'trend_entry' | 'meetup'
  target_id uuid not null,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table reactions (
  target_type text not null,
  target_id uuid not null,
  user_id uuid references profiles(id) on delete cascade,
  emoji text not null default '❤️',
  created_at timestamptz not null default now(),
  primary key (target_type, target_id, user_id)
);

-- 8. Row-level security ---------------------------------------------------
-- Since this is a closed friend group, the simplest safe policy is:
-- "any signed-in user can read everything, and can only write their own rows."
alter table profiles enable row level security;
alter table albums enable row level security;
alter table photos enable row level security;
alter table dumps enable row level security;
alter table dump_photos enable row level security;
alter table challenges enable row level security;
alter table challenge_submissions enable row level security;
alter table trends enable row level security;
alter table trend_entries enable row level security;
alter table meetups enable row level security;
alter table meetup_rsvps enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;

-- Read access for any logged-in friend
create policy "read all - profiles" on profiles for select using (auth.role() = 'authenticated');
create policy "read all - albums" on albums for select using (auth.role() = 'authenticated');
create policy "read all - photos" on photos for select using (auth.role() = 'authenticated');
create policy "read all - dumps" on dumps for select using (auth.role() = 'authenticated');
create policy "read all - dump_photos" on dump_photos for select using (auth.role() = 'authenticated');
create policy "read all - challenges" on challenges for select using (auth.role() = 'authenticated');
create policy "read all - challenge_submissions" on challenge_submissions for select using (auth.role() = 'authenticated');
create policy "read all - trends" on trends for select using (auth.role() = 'authenticated');
create policy "read all - trend_entries" on trend_entries for select using (auth.role() = 'authenticated');
create policy "read all - meetups" on meetups for select using (auth.role() = 'authenticated');
create policy "read all - meetup_rsvps" on meetup_rsvps for select using (auth.role() = 'authenticated');
create policy "read all - comments" on comments for select using (auth.role() = 'authenticated');
create policy "read all - reactions" on reactions for select using (auth.role() = 'authenticated');

-- Write access: only as yourself
create policy "insert own - profiles" on profiles for update using (auth.uid() = id);
create policy "insert own - albums" on albums for insert with check (auth.uid() = owner_id);
create policy "insert own - photos" on photos for insert with check (auth.uid() = uploader_id);
create policy "insert own - dumps" on dumps for insert with check (auth.uid() = created_by);
create policy "insert own - dump_photos" on dump_photos for insert with check (auth.role() = 'authenticated');
create policy "insert own - challenges" on challenges for insert with check (auth.uid() = created_by);
create policy "insert own - challenge_submissions" on challenge_submissions for insert with check (auth.uid() = user_id);
create policy "insert own - trends" on trends for insert with check (auth.uid() = created_by);
create policy "insert own - trend_entries" on trend_entries for insert with check (auth.uid() = user_id);
create policy "insert own - meetups" on meetups for insert with check (auth.uid() = created_by);
create policy "insert own - meetup_rsvps" on meetup_rsvps for insert with check (auth.uid() = user_id);
create policy "insert own - comments" on comments for insert with check (auth.uid() = user_id);
create policy "insert own - reactions" on reactions for insert with check (auth.uid() = user_id);
