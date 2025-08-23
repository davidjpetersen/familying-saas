import type { BookMetadata, BookIdentifier } from '@/types/book';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const OPENLIBRARY_SEARCH_API = 'https://openlibrary.org/search.json';

type SearchParams = {
  q?: string; // free text search
  isbn?: string; // ISBN-10 or ISBN-13
  limit?: number;
};

function toHttps(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.protocol = 'https:';
    return u.toString();
  } catch {
    return url.startsWith('//') ? `https:${url}` : url;
  }
}


function normalizeGoogleItem(item: any): BookMetadata | null {
  if (!item || !item.volumeInfo) return null;
  const v = item.volumeInfo;
  const ids: BookIdentifier[] = [];
  if (Array.isArray(v.industryIdentifiers)) {
    for (const ii of v.industryIdentifiers) {
      if (ii?.identifier) ids.push({ type: ii.type || 'UNKNOWN', value: String(ii.identifier) });
    }
  }
  const image = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail;
  return {
    source: 'google',
    sourceId: item.id,
    title: v.title || 'Untitled',
    subtitle: v.subtitle || null,
    authors: Array.isArray(v.authors) ? v.authors : [],
    publishedDate: v.publishedDate || null,
    description: v.description || null,
    pageCount: typeof v.pageCount === 'number' ? v.pageCount : null,
    categories: Array.isArray(v.categories) ? v.categories : [],
    language: v.language || null,
    thumbnail: toHttps(image),
    previewUrl: v.previewLink ? toHttps(v.previewLink) : null,
    identifiers: ids,
  };
}

function normalizeOpenLibraryDoc(doc: any): BookMetadata | null {
  if (!doc) return null;
  // cover_i -> https://covers.openlibrary.org/b/id/{cover_i}-L.jpg
  const cover = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null;
  const identifiers: BookIdentifier[] = [];
  for (const key of ['isbn', 'isbn10', 'isbn13']) {
    const arr = doc[key];
    if (Array.isArray(arr)) {
      for (const val of arr) identifiers.push({ type: key.toUpperCase(), value: String(val) });
    }
  }
  if (Array.isArray(doc.oclc)) identifiers.push(...doc.oclc.map((v: any) => ({ type: 'OCLC', value: String(v) })));
  if (Array.isArray(doc.lccn)) identifiers.push(...doc.lccn.map((v: any) => ({ type: 'LCCN', value: String(v) })));
  return {
    source: 'openlibrary',
    sourceId: doc.key || doc.edition_key?.[0] || doc.cover_edition_key || doc.seed?.[0] || '',
    title: doc.title || 'Untitled',
    subtitle: doc.subtitle || null,
    authors: Array.isArray(doc.author_name) ? doc.author_name : [],
    publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : null,
    description: Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.subtitle || null,
    pageCount: typeof doc.number_of_pages_median === 'number' ? doc.number_of_pages_median : null,
    categories: Array.isArray(doc.subject) ? doc.subject.slice(0, 8) : [],
    language: Array.isArray(doc.language) ? doc.language[0] : null,
    thumbnail: toHttps(cover),
    previewUrl: doc.key ? `https://openlibrary.org${doc.key}` : null,
    identifiers,
  };
}

export async function searchGoogleBooks(params: SearchParams): Promise<BookMetadata[]> {
  const qParts: string[] = [];
  if (params.isbn) qParts.push(`isbn:${encodeURIComponent(params.isbn)}`);
  if (params.q) qParts.push(encodeURIComponent(params.q));
  const q = qParts.join('+');
  const url = `${GOOGLE_BOOKS_API}?q=${q}&maxResults=${Math.min(params.limit ?? 5, 20)}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json = await res.json();
  const items = Array.isArray(json.items) ? json.items : [];
  return items.map(normalizeGoogleItem).filter(Boolean) as BookMetadata[];
}

export async function searchOpenLibrary(params: SearchParams): Promise<BookMetadata[]> {
  const p = new URLSearchParams();
  if (params.isbn) p.set('isbn', params.isbn);
  if (params.q) p.set('q', params.q);
  p.set('limit', String(Math.min(params.limit ?? 5, 20)));
  const url = `${OPENLIBRARY_SEARCH_API}?${p.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json = await res.json();
  const docs = Array.isArray(json.docs) ? json.docs : [];
  return docs.map(normalizeOpenLibraryDoc).filter(Boolean) as BookMetadata[];
}

export async function fetchByIsbn(isbn: string, limit = 5): Promise<BookMetadata[]> {
  const [google, openlib] = await Promise.all([
    searchGoogleBooks({ isbn, limit }),
    searchOpenLibrary({ isbn, limit }),
  ]);
  // De-duplicate by ISBN-13/10 when possible, else by title+author
  const byKey = new Map<string, BookMetadata>();
  const makeKey = (b: BookMetadata) => {
    const isbn13 = b.identifiers?.find(i => i.type.includes('13'))?.value;
    const isbn10 = b.identifiers?.find(i => i.type.includes('10'))?.value;
    return (isbn13 || isbn10 || `${b.title}|${b.authors?.[0] || ''}`).toLowerCase();
  };
  for (const list of [google, openlib]) {
    for (const b of list) byKey.set(makeKey(b), b);
  }
  return Array.from(byKey.values());
}

export async function fetchByQuery(q: string, limit = 5): Promise<BookMetadata[]> {
  const [google, openlib] = await Promise.all([
    searchGoogleBooks({ q, limit }),
    searchOpenLibrary({ q, limit }),
  ]);
  // Merge and prefer Google first for richer metadata, then OpenLibrary
  const seen = new Set<string>();
  const result: BookMetadata[] = [];
  const push = (b: BookMetadata) => {
    const key = `${b.title}|${b.authors?.[0] || ''}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(b);
    }
  };
  google.forEach(push);
  openlib.forEach(push);
  return result.slice(0, limit);
}

export async function getBookByIsbn(isbn: string): Promise<BookMetadata | null> {
  const results = await fetchByIsbn(isbn, 1);
  return results[0] ?? null;
}
