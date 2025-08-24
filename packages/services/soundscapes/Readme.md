# Soundscapes Microservice Spec

> A calming audio gallery for families, designed for the Familying.org platform.

---

## Overview

**Soundscapes** is a white noise and ambient sound player designed to support family wellness through calming audio. This microservice provides a gallery-based experience, similar to Netflix or Hulu, allowing parents to discover, play, and set timers on soothing sounds.

---

## Goals

- Deliver an intuitive, mobile-first gallery of looping ambient sounds.
- Support basic playback (play/pause, volume, loop) and sleep timer.
- Enable admin management of sound files, thumbnails, categories, and metadata.
- Integrate with Supabase for file storage and database.
- Ensure future extensibility for personalization and A/B testing.

---

## Features

### `/soundscapes` – Public UI

| Feature         | Description |
|----------------|-------------|
| Hero Section   | Title + description: _"Gentle sounds to help your family rest, recharge, and refocus."_ |
| Category Rows  | Horizontally scrollable rows by category (e.g., Sleep, Nature, White Noise, Focus) |
| Sound Cards    | Thumbnail image + title; hover/focus shows play button and description |
| Audio Playback | Global or inline player: play/pause, volume, loop |
| Sleep Timer    | Optional auto-stop after 15 / 30 / 60 minutes |

#### Sound Categories

- `Sleep`
- `Nature`
- `White Noise`
- `Focus`

---

### `/admin/soundscapes` – Admin UI

| Action             | Input Type           |
|--------------------|----------------------|
| Upload Audio       | File input (`.mp3`, `.wav`) |
| Upload Thumbnail   | Image input (`.jpg`, `.png`) |
| Title              | Text field           |
| Description        | Multiline textarea   |
| Category           | Select dropdown      |
| Publish Status     | Toggle (Published / Unpublished) |
| Sort Order         | Numeric or drag-to-reorder UI |
| Preview            | Embedded thumbnail + player |

Access to this route is restricted to authenticated admin users via Clerk.

---

## Database Schema

### Table: `soundscapes`

```sql
create table public.soundscapes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text check (category in ('Sleep', 'Nature', 'White Noise', 'Focus')) default 'Sleep',
  audio_url text not null,
  thumbnail_url text not null,
  is_published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

### Supabase Storage Buckets

- `soundscapes-audio`: for uploaded .mp3 / .wav files
- `soundscapes-thumbnails`: for .jpg / .png thumbnails
- Public read; write access gated by role-based auth

---

## Frontend Stack

| Tool     | Purpose             |
|----------|---------------------|
| Next.js  | Application framework |
| React    | UI rendering        |
| Tailwind | Styling / layout    |
| Shadcn/ui| Component primitives|
| Clerk    | Auth & role-based access |
| Supabase | DB + storage backend |

---

## API Endpoints (Planned)

- `GET /api/soundscapes`: public fetch for gallery
- `POST /api/soundscapes`: admin create
- `PUT /api/soundscapes/:id`: admin update
- `DELETE /api/soundscapes/:id`: admin delete

---

## Future Enhancements

- Favorites or "Recently Played"
- Quiz-based personalization (e.g. "Overwhelmed parent" → "Train Ride")
- A/B testing of layout, categories, or autoplay previews
- Offline support via PWA
- Audio collections or story-driven soundscapes (e.g. "Camping Trip")

---

## Versioning

- Initial spec version: v0.1
- MVP target: `/soundscapes` + `/admin/soundscapes`
- Track changes in `/docs/specs/soundscapes.md`
- Storage Reference: `supabase/storage/soundscapes-*`

