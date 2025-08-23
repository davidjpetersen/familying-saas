export type EmbedJob = { book_id?: string; chunk_id?: string };

export async function enqueueEmbed(_job: EmbedJob) {
  void _job;
  // TODO: integrate with a real queue
  return { enqueued: true };
}
