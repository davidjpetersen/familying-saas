"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { user } = useUser();
  const initialTheme = (user?.publicMetadata.theme as string) || "light";
  const [theme, setTheme] = useState<string>(initialTheme);

  const toggle = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    await user?.update({ publicMetadata: { theme: newTheme } });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Toggle between light and dark appearance.
      </p>
      <Button onClick={toggle}>
        {theme === "dark" ? "Use Light Mode" : "Use Dark Mode"}
      </Button>
    </div>
  );
}

