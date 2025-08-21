"use client";

import React from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Hero from "@/components/dashboard/Hero";
import RowCarousel from "@/components/dashboard/RowCarousel";

const mockRows = [
  {
    id: "for-your-family",
    title: "For Your Family",
    items: new Array(8).fill(0).map((_, i) => ({
      id: `fyf-${i}`,
      title: `Calm Kit ${i + 1}`,
      meta: "Calm • 3–5 min • Ages 3–7",
      thumbnail: `/readme/hero.png`,
      status: i === 0 ? "In progress" : i === 1 ? "New" : undefined,
    })),
  },
  {
    id: "continue",
    title: "Continue with Star",
    items: new Array(5).fill(0).map((_, i) => ({
      id: `cont-${i}`,
      title: `Bedtime Quest ${i + 1}`,
      meta: "Story • 10–15 min • Ages 4–8",
      thumbnail: `/readme/jsmpro.png`,
      status: i === 0 ? "In progress" : undefined,
    })),
  },
  {
    id: "new-week",
    title: "New This Week",
    items: new Array(6).fill(0).map((_, i) => ({
      id: `new-${i}`,
      title: `30‑min Dinner ${i + 1}`,
      meta: "Meal • 30 min • Family",
      thumbnail: `/readme/hero.png`,
      status: i === 0 ? "New" : undefined,
    })),
  },
];

export default function DashboardPage() {
  return (
    <main className="py-8">
      <SignedIn>

        <section className="mb-8">
          <Hero
            title="Tonight: Star's Bedtime Adventure"
            description="A gentle, narrated bedtime quest tailored to Star's age and preferences."
            ctaLabel="Play"
            imageSrc="/readme/hero.png"
          />
        </section>

        <section className="space-y-8">
          {mockRows.map((row) => (
            <RowCarousel key={row.id} title={row.title} items={row.items} />
          ))}
        </section>
      </SignedIn>

      <SignedOut>
        <div className="py-24 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to view your dashboard</h2>
          <SignInButton>
            <button className="rounded-md bg-primary px-4 py-2 text-white">Sign in</button>
          </SignInButton>
        </div>
      </SignedOut>
    </main>
  );
}
