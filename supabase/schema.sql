-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (linked to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Books table
create table if not exists books (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  isbn text,
  title text not null,
  author text not null,
  subject text,
  cover_url text,
  condition text not null check (condition in ('new', 'good', 'fair', 'worn')),
  listing_type text not null check (listing_type in ('share', 'sell')),
  price numeric check (price >= 0),
  description text,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Requests table
create table if not exists requests (
  id uuid primary key default uuid_generate_v4(),
  book_id uuid not null references books(id) on delete cascade,
  requester_id uuid not null references profiles(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table books enable row level security;
alter table requests enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Books policies
create policy "Available books viewable by authenticated users"
  on books for select
  to authenticated
  using (true);

create policy "Users can insert own books"
  on books for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Users can update own books"
  on books for update
  to authenticated
  using (auth.uid() = owner_id);

create policy "Users can delete own books"
  on books for delete
  to authenticated
  using (auth.uid() = owner_id);

-- Requests policies
create policy "Users can view requests involving them"
  on requests for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = owner_id);

create policy "Users can create requests"
  on requests for insert
  to authenticated
  with check (auth.uid() = requester_id);

create policy "Owners can update request status"
  on requests for update
  to authenticated
  using (auth.uid() = owner_id);
