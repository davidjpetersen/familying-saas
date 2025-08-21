"use client";

import React from "react";

export default function ProfileSwitcher() {
  return (
    <div className="flex items-center gap-3">
      <button className="flex items-center gap-2 rounded-full bg-muted p-2 text-sm focus:outline-none focus:ring-2">
        <img src="/readme/jsmpro.png" alt="Star" className="h-6 w-6 rounded-full" />
        <span className="hidden sm:inline">Viewing as Star</span>
      </button>
    </div>
  );
}
