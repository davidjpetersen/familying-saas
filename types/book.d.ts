export type BookIdentifier = {
  type: string; // e.g., ISBN_10, ISBN_13, OCLC, LCCN
  value: string;
};

export type BookMetadata = {
  source: 'google' | 'openlibrary';
  sourceId: string;
  title: string;
  subtitle?: string | null;
  authors: string[];
  publishedDate?: string | null;
  description?: string | null;
  pageCount?: number | null;
  categories?: string[];
  language?: string | null;
  thumbnail?: string | null;
  previewUrl?: string | null;
  identifiers?: BookIdentifier[];
};
