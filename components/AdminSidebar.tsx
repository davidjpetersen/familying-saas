"use client"

import Link from "next/link";
import * as React from "react";
import { Book, Layers, Grid, Users, Bed, UtensilsCrossed, MessageSquare, Activity, Waves } from "lucide-react";

export default function AdminSidebar() {
  const items = [
    { href: '/admin', label: 'Overview', icon: Grid },
    { href: '/admin/books', label: 'Books', icon: Layers },
    { href: '/admin/summaries', label: 'Summaries', icon: Book },
  { href: '/admin/book_summaries', label: 'Book Summaries', icon: Book },
  { href: '/admin/bedtime_story_generator', label: 'Bedtime Story Generator', icon: Bed },
  { href: '/admin/meal_planner', label: 'Meal Planner', icon: UtensilsCrossed },
  { href: '/admin/conversation_starters', label: 'Conversation Starters', icon: MessageSquare },
    { href: '/admin/activities', label: 'Activities', icon: Activity },
    { href: '/admin/soundscapes', label: 'Soundscapes', icon: Waves },
    { href: '/admin/admins', label: 'Admins', icon: Users },
  ];

  return (
    <aside className="w-64 border-r px-3 py-6 bg-background min-h-screen">
      <div className="mb-6 px-2">
        <h3 className="text-lg font-semibold">Admin</h3>
        <p className="text-sm text-muted-foreground mt-1">Manage site features</p>
      </div>

      <nav className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-accent/50">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
