"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { dark, shadcn } from "@clerk/themes";
import { Moon } from "lucide-react";

const Navbar = () => {
  const { theme } = useTheme();
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        Familying
      </Link>
      <div className="flex gap-4 items-center">
  <Link href="/subscription">Subscriptions</Link>

        <SignedOut>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
      <UserButton
            appearance={{
              elements: {
                userButtonPopoverCard: "min-w-[260px]",
              },
              baseTheme: theme === "dark" ? dark : shadcn,
            }}
            userProfileMode="modal"
          >
           
            <UserButton.UserProfilePage
              label="Appearance"
              url="appearance"
              labelIcon={<Moon className="h-4 w-4" />}
            >
              <div className="p-4 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">Choose your preferred theme:</p>
                <ThemeToggle />
              </div>
            </UserButton.UserProfilePage>
          </UserButton>
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;
