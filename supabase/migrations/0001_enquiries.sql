-- MAAIRA enquiries & callback requests.
-- Apply with the Supabase CLI or SQL editor, then set SUPABASE_URL and
-- SUPABASE_SERVICE_ROLE_KEY (server-side only) for the Next.js app.

create table if not exists public.enquiries (
  id                text primary key,
  created_at        timestamptz not null default now(),
  status            text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  kind              text not null check (kind in ('enquiry', 'callback')),
  name              text not null check (char_length(name) between 2 and 80),
  email             text check (email is null or char_length(email) <= 254),
  phone             text check (phone is null or phone ~ '^\+[0-9]{8,15}$'),
  piece_id          text,
  piece_name        text,
  message           text check (message is null or char_length(message) <= 2000),
  preferred_contact text check (preferred_contact is null or preferred_contact in ('email', 'phone')),
  callback_window   text check (callback_window is null or callback_window in ('morning', 'afternoon', 'evening', 'any')),
  consent_at        timestamptz not null,
  idempotency_key   text not null unique
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status);

-- Row Level Security on, with no policies: the anon/public keys can neither
-- read nor write. Only the server, using the service-role key, has access.
alter table public.enquiries enable row level security;
