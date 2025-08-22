"use client";

import * as React from 'react';

export default function InsightModal({ open, onClose, insight }: { open: boolean; onClose: () => void; insight: any | null }) {
  if (!open || !insight) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 max-w-2xl w-full p-6 bg-white rounded shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold">{insight.type ?? 'Insight'}</div>
            <div className="text-sm text-muted-foreground mt-1">{insight.id}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground">Close</button>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">{insight.content}</div>
      </div>
    </div>
  );
}
