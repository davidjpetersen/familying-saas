import { z } from "zod";

export const zSummary = z.object({
  // Publication workflow: include legacy/possible values to avoid rejecting rows during migrations
  status: z.enum(["draft", "in_review", "review", "published", "archived", "final"]).default("draft"),
  // owner in this app may be an email or user id; keep it permissive
  owner: z.string().optional().nullable(),
  owner_user_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().min(1).max(128)).max(50).transform((arr) => arr.map((t) => t.toLowerCase().replace(/[^a-z0-9-_]/g, "-")) ),

  // JSON blobs
  document: z.any(),
  book: z.any(),
  metadata: z.any(),
  external_ids: z.record(z.any()).optional().nullable(),
  toc: z.any().optional().nullable(),
  notable_quotes: z.any().optional().nullable(),
  source_citations: z.any().optional().nullable(),

  // Bibliographic / identifiers
  slug: z.string().optional().nullable(),
  isbn_10: z.string().optional().nullable(),
  isbn_13: z.string().optional().nullable(),
  canonical_url: z.string().url().optional().nullable(),
  publisher: z.string().optional().nullable(),
  publication_date: z.string().optional().nullable(),
  edition: z.string().optional().nullable(),
  language_code: z.string().regex(/^[a-z]{2}$/i).optional().nullable(),
  page_count: z.coerce.number().int().positive().optional().nullable(),
  series_name: z.string().optional().nullable(),
  series_number: z.coerce.number().optional().nullable(),

  // UX / consumption
  content_warnings: z.array(z.string()).optional().nullable(),
  audience: z.enum(["general","parents","educators","higher_ed"]).optional().nullable(),
  difficulty: z.enum(["intro","intermediate","advanced"]).optional().nullable(),
  reading_time_minutes: z.coerce.number().int().optional().nullable(),
  audio_duration_minutes: z.coerce.number().int().optional().nullable(),

  // Asset paths
  cover_image_path: z.string().optional().nullable(),
  pdf_path: z.string().optional().nullable(),
  audio_path: z.string().optional().nullable(),

  // Moderation / QA
  qa_flags: z.record(z.any()).optional().nullable(),
  moderation_notes: z.string().optional().nullable(),

  // Counts / analytics
  view_count: z.coerce.number().int().optional().nullable(),
  favorite_count: z.coerce.number().int().optional().nullable(),
  rating_count: z.coerce.number().int().optional().nullable(),
  rating_avg: z.coerce.number().optional().nullable(),

  visibility: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  version: z.coerce.number().optional().nullable(),
});

export type SummaryInput = z.input<typeof zSummary>;
