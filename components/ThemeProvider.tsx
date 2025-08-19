"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  useEffect(() => {
    const theme = (user?.publicMetadata.theme as string) || "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [user]);

  return <>{children}</>;
}

