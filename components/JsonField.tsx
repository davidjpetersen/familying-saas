"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Monaco Editor is heavy; load dynamically
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type JsonFieldProps = {
  value: string;
  onChange: (v: string) => void;
  schema?: any;
  height?: string | number;
};

export default function JsonField({ value, onChange, schema, height = 300 }: JsonFieldProps) {
  const editorRef = useRef<any>(null);

  return (
    <div className="border rounded">
      <MonacoEditor
        height={height}
        defaultLanguage="json"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={(editor) => (editorRef.current = editor)}
        options={{ minimap: { enabled: false }, tabSize: 2 }}
      />
    </div>
  );
}
