"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        size="icon"
        aria-label="Light theme"
        onClick={() => setTheme("light")}
        title="Light"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        size="icon"
        aria-label="Dark theme"
        onClick={() => setTheme("dark")}
        title="Dark"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "system" ? "default" : "ghost"}
        size="icon"
        aria-label="System theme"
        onClick={() => setTheme("system")}
        title="System"
      >
        <Laptop className="h-4 w-4" />
      </Button>
    </div>
  );
}
