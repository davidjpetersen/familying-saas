"use client";

import * as React from "react";
import Link from "next/link";
import { features } from "@/lib/features";

export default function FeaturesNavMenu() {
  // For now, all registered features are visible; attach gating later if needed.
  return (
    <nav className="flex items-center gap-2 px-2 py-1 overflow-x-auto">
      {features.map((f) => (
        <Link key={f.id} href={`/services/${f.id}`} className="text-sm px-3 py-1 rounded hover:bg-accent">
          {f.title}
        </Link>
      ))}
    </nav>
  );
}
