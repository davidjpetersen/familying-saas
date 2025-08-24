"use client";

import * as React from "react";
import Link from "next/link";
import { featuresMeta } from "@/lib/features.meta";

export default function FeaturesNavMenu() {
  // For now, all registered features are visible; attach gating later if needed.
  return (
    <nav className="flex items-center gap-2 px-2 py-1 overflow-x-auto">
      {featuresMeta.map((f) => (
        <Link key={f.id} href={f.href} className="text-sm px-3 py-1 rounded hover:bg-accent">
          {f.title}
        </Link>
      ))}
    </nav>
  );
}
