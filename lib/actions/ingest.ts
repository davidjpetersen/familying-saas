// Placeholder ingest worker wiring. Implement real text extraction + chunking later.
export type IngestJob = { book_id: string; owner_user_id: string; source_uri?: string | null };

export async function enqueueIngest(_job: IngestJob) {
  // TODO: integrate with a real queue (e.g., QStash, Supabase Functions)
  return { enqueued: true };
}
