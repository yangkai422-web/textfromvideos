-- Transcript cache: this is the project's gross-margin source.
create table transcripts (
  id           bigserial primary key,
  platform     text not null,          -- tiktok | instagram
  video_id     text not null,
  lang         text,
  source       text,                   -- captions | asr
  text         text,
  srt          text,
  created_at   timestamptz default now(),
  unique (platform, video_id, lang)
);
create index on transcripts (created_at);

-- Job table: used by the async queue (and by the Day 1 synchronous API for status).
create table jobs (
  id          bigserial primary key,
  url         text not null,
  status      text not null,           -- queued | running | done | failed
  error       text,
  created_at  timestamptz default now(),
  finished_at timestamptz
);

-- Optional Day-1 analytics + unpaid quota tracking. Not part of the original
-- two-table list; safe to apply after the tables above.
create table if not exists events (
  id          bigserial primary key,
  name        text not null,
  ip          text,
  payload     jsonb,
  created_at  timestamptz default now()
);
create index if not exists events_name_created_at_idx on events (name, created_at);
create index if not exists events_ip_created_at_idx on events (ip, created_at);
