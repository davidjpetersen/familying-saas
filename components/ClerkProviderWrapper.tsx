"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark, shadcn } from "@clerk/themes";
import { useTheme } from "@/components/ThemeProvider";

export default function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const baseTheme = theme === "dark" ? dark : shadcn;

  const appearance = React.useMemo(() => ({
    baseTheme,
    elements: {
      userButtonPopoverCard: "min-w-[260px]",
    },
  }), [baseTheme]);

  return (
    <ClerkProvider appearance={appearance}>
      {children}
    </ClerkProvider>
  );
}
