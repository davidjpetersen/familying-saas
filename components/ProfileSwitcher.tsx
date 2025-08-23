"use client";

import React from "react";
import Image from "next/image";

export default function ProfileSwitcher() {
  return (
    <div className="flex items-center gap-3">
      <button className="flex items-center gap-2 rounded-full bg-muted p-2 text-sm focus:outline-none focus:ring-2">
        <Image src="/readme/jsmpro.png" alt="Star" width={24} height={24} className="rounded-full" />
        <span className="hidden sm:inline">Viewing as Star</span>
      </button>
    </div>
  );
}
