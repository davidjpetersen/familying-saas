import { z } from "zod";

export const zSummary = z.object({
  // Publication workflow (DB: text)
  status: z.string().default("draft").nullable().optional(),

  // Ownership
  owner: z.string().optional().nullable(),
  owner_user_id: z.string().uuid().optional().nullable(),
  updated_by_user_id: z.string().uuid().optional().nullable(),

  // Tags (DB: text) — store a single string (e.g., comma-separated)
  tags: z.string().optional().nullable(),

  // JSON blobs
  document: z.any().optional(),
  book: z.any().optional(),
  metadata: z.any().optional(),
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
  language_code: z.string().optional().nullable(),
  page_count: z.coerce.number().int().optional().nullable(),
  series_name: z.string().optional().nullable(),
  series_number: z.coerce.number().optional().nullable(),

  // UX / consumption (DB: text for content_warnings/audience/difficulty)
  content_warnings: z.string().optional().nullable(),
  audience: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
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
