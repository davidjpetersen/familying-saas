"use client";

import React from "react";
import Image from "next/image";

type Props = {
  title: string;
  description?: string;
  ctaLabel?: string;
  imageSrc?: string;
};

export default function Hero({ title, description, ctaLabel = "Play", imageSrc = "/readme/hero.png" }: Props) {
  return (
    <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-sky-600 to-indigo-600 text-white"> 
      <div className="md:flex md:items-center">
        <div className="p-6 md:w-1/2">
          <h2 className="text-2xl md:text-4xl font-bold leading-tight">{title}</h2>
          {description && <p className="mt-3 text-sm opacity-90">{description}</p>}
          <div className="mt-5">
            <button className="inline-flex items-center gap-2 rounded-md bg-white/90 text-black px-4 py-2 font-medium shadow-sm hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2">
              {ctaLabel}
            </button>
            <button className="ml-3 inline-flex items-center gap-2 rounded-md bg-white/10 text-white px-3 py-2 text-sm">Save</button>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="h-56 md:h-48 lg:h-64 w-full relative">
            <Image src={imageSrc} alt="hero" fill className="object-cover opacity-95" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
