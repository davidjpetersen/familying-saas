# Book Summaries Microservice — Integration Notes

This app implements a thin-slice of the plan: DB tables for books, book_chunks, summaries, and minimal admin/public endpoints.

Admin endpoints (stubs):

- POST /api/admin/books/:id/ingest → { job_id }
- POST /api/admin/books/:id/embed → { job_id }
- PATCH /api/admin/summaries/:id → updates partial fields
- POST /api/admin/summaries/:id/render → { job_id, next_render_version }

Public endpoints:

- GET /api/library?tag=&page=&pageSize= → published rows with book info
- GET /api/books/:slug/summary → returns payload JSON (inline assembly for now)
- GET /api/summaries/:id/download.pdf → returns { url } placeholder

DB Migrations:

- 0006_vectorized_books_and_summaries.sql

Follow-ups:

- Wire real job queue for ingest/embed/render
- Implement signed redirects for payload/pdf URIs
- Build Admin UI screens per plan (/admin/books, /admin/summaries)
