import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

async function run() {
  const root = path.resolve(__dirname, '..');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  const packagesDir = path.join(root, 'packages');
  const pkgs = fs.readdirSync(packagesDir).filter((p) => fs.existsSync(path.join(packagesDir, p, 'migrations')));

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  await client.query('create table if not exists _migrations (id text primary key, applied_at timestamptz not null default now())');

  for (const pkg of pkgs) {
    const migDir = path.join(packagesDir, pkg, 'migrations');
    const files = fs.readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const id = `${pkg}:${file}`;
      const already = await client.query('select 1 from _migrations where id=$1', [id]);
      if (already.rowCount) continue;
      const sql = fs.readFileSync(path.join(migDir, file), 'utf8');
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into _migrations(id) values ($1)', [id]);
        await client.query('commit');
        console.log('Applied', id);
      } catch (e) {
        await client.query('rollback');
        console.error('Failed', id, e);
        process.exit(1);
      }
    }
  }

  await client.end();
}

run();
