-- Enable Row Level Security (Recommended but optional for this demo, strictly sticking to table creation)

-- 1. Audit Logs Table
create table if not exists auth_logs ( -- wait, I used 'audit_logs' in code.
  id uuid default gen_random_uuid() primary key,
  timestamp timestamptz not null default now(),
  user_email text not null,
  action text not null,
  details text,
  status text default 'SUCCESS'
);

create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  timestamp timestamptz not null default now(),
  user_email text not null,
  action text not null,
  details text,
  status text default 'SUCCESS'
);

-- 2. News Table
create table if not exists news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  summary text,
  content text,
  department text,
  author text,
  created_at timestamptz default now(),
  is_featured boolean default false,
  image_url text,
  thumbnail_url text
);

-- 3. Files Table (Metadata)
create table if not exists files (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  size bigint,
  type text,
  uploaded_at timestamptz default now(),
  department text,
  preview_url text -- Storing Data URI for now as per legacy implementation, ideally move to Storage later
);

-- Note: In a real production app, you would create a Storage Bucket named 'files' 
-- and store the path in 'preview_url' instead of the base64 data.
