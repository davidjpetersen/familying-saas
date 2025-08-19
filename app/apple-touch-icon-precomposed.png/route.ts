import { NextResponse } from "next/server";

// 1x1 transparent PNG
const pngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/aqG5c0AAAAASUVORK5CYII=";

export function GET() {
  const buf = Buffer.from(pngBase64, "base64");
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
