-- VYROX IA's real record: paste in Supabase > SQL Editor and run once.
create table public.predictions (
  id bigint generated always as identity primary key,
  match_id bigint not null,
  date date not null,
  league text not null,
  teams text not null,
  market text not null check (market in ('home_win', 'away_win', 'over_2_5', 'under_2_5', 'btts_yes')),
  prediction text not null,
  odd numeric(5, 2) not null check (odd > 1),
  status text not null default 'pending' check (status in ('pending', 'won', 'lost')),
  created_at timestamptz not null default now(),
  unique (match_id, market)
);

create index predictions_status_date on public.predictions (status, date);

-- No policies: only the backend's service_role key, which bypasses row level security, reads and writes the table.
alter table public.predictions enable row level security;

-- New Supabase projects give API roles no privileges on tables made in SQL: the backend's role needs these.
grant select, insert, update on public.predictions to service_role;
