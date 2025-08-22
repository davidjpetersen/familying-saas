import { z } from "zod";

const semverRegex = /^\d+\.\d+\.\d+$/;

export const zSummary = z.object({
  schema_version: z.string().regex(semverRegex).optional().or(z.literal("")),
  status: z.enum(["draft", "review", "published", "archived"]).default("draft"),
  owner: z.string().email().optional(),
  tags: z.array(z.string().min(1).max(32)).max(20).transform((arr) => arr.map((t) => t.toLowerCase().replace(/[^a-z0-9-_]/g, "-") )),
  document: z.any(),
  book: z.any(),
  metadata: z.any(),
});

export type SummaryInput = z.input<typeof zSummary>;
