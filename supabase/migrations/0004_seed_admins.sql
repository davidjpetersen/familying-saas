-- Seed the admins table with the initial admin
-- Uses an upsert so the migration can be re-applied safely

insert into public.admins (id, clerk_user_id, email, created_at)
values (
  'user_30XBoizcJs7mI8LqD9keBwkcR1a',
  'user_30XBoizcJs7mI8LqD9keBwkcR1a',
  'david.petersen@familying.org',
  now()
)
on conflict (id) do update set clerk_user_id = excluded.clerk_user_id, email = excluded.email;
