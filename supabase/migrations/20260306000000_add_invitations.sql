create table if not exists public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  invited_by uuid not null references public.profiles (id) on delete restrict,
  invited_email text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  constraint unique_pending_invitation unique (group_id, invited_email) where status = 'pending'
);

alter table public.group_invitations enable row level security;

create policy "invitations readable by group members"
  on public.group_invitations
  for select
  using (
    exists (
      select 1
      from public.group_members gm
      where gm.group_id = group_invitations.group_id
        and gm.user_id = auth.uid()
    )
    or invited_by = auth.uid()
  );

create policy "invitations creatable by group members"
  on public.group_invitations
  for insert
  with check (
    exists (
      select 1
      from public.group_members gm
      where gm.group_id = group_invitations.group_id
        and gm.user_id = auth.uid()
    )
  );

create policy "invitations updateable by group members"
  on public.group_invitations
  for update
  using (
    exists (
      select 1
      from public.group_members gm
      where gm.group_id = group_invitations.group_id
        and gm.user_id = auth.uid()
    )
    or invited_by = auth.uid()
  )
  with check (
    exists (
      select 1
      from public.group_members gm
      where gm.group_id = group_invitations.group_id
        and gm.user_id = auth.uid()
    )
    or invited_by = auth.uid()
  );

-- Function to accept an invitation and add user to group
create or replace function accept_group_invitation(invitation_token text, user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_status text;
  v_expires_at timestamptz;
begin
  -- Get invitation details
  select 
    group_id, status, expires_at
  into 
    v_group_id, v_status, v_expires_at
  from group_invitations
  where token = invitation_token;

  -- Check if invitation exists
  if v_group_id is null then
    return json_build_object('success', false, 'error', 'Invitation not found');
  end if;

  -- Check if invitation is valid
  if v_status != 'pending' then
    return json_build_object('success', false, 'error', 'Invitation is no longer valid');
  end if;

  if v_expires_at < now() then
    return json_build_object('success', false, 'error', 'Invitation has expired');
  end if;

  -- Add user to group if not already a member
  insert into group_members (group_id, user_id, role)
  values (v_group_id, user_id, 'member')
  on conflict do nothing;

  -- Update invitation status
  update group_invitations
  set status = 'accepted'
  where token = invitation_token;

  return json_build_object('success', true, 'group_id', v_group_id);
end;
$$;
