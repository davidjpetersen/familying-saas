"use client";
import React from "react";

type TagInputProps = {
  value: string[];
  onChange: (v: string[]) => void;
};

export default function TagInput({ value, onChange }: TagInputProps) {
  const addTag = (t: string) => {
    const tag = t.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    if (!tag) return;
    if (value.includes(tag)) return;
    onChange([...value, tag].slice(0, 20));
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((t, i) => (
          <button key={t} type="button" className="px-2 py-1 bg-gray-100 rounded" onClick={() => remove(i)}>
            {t} ×
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Add tag and press Enter"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = "";
          }
        }}
        className="mt-2 w-full border rounded px-2 py-1"
      />
    </div>
  );
}
