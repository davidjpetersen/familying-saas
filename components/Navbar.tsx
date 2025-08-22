"use client";

import { SignedOut, SignInButton, SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { dark, shadcn } from "@clerk/themes";
import { Users, Moon, Shield } from "lucide-react";

import ProfileSwitcher from "@/components/ProfileSwitcher";
import FamilyMembersManager from "@/components/FamilyMembersManager";
import FeaturesNavMenu from "@/components/FeaturesNavMenu";

function AdminLink() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await fetch('/api/admin/me');
        const json = await res.json();
        if (!mounted) return;
        setIsAdmin(!!json?.isAdmin);
      } catch (e) {
        if (!mounted) return;
        setIsAdmin(false);
      }
    }
    if (user) check();
    return () => { mounted = false; };
  }, [user]);

  if (!user) return null;
  if (isAdmin === null) return null; // or a small loader
  if (!isAdmin) return null;

  return (
    <Link href="/admin" className="flex items-center">
      <Button variant="ghost" className="text-sm px-2 py-1">
        <Shield className="h-4 w-4 mr-2" />
        Admin
      </Button>
    </Link>
  );
}

const Navbar = () => {
  const { theme } = useTheme();
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        Familying
      </Link>
  <div className="flex gap-4 items-center">
        <SignedOut>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>
    <SignedIn>

      <FeaturesNavMenu />
      <AdminLink />
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
              label="Family Members"
              url="family"
              labelIcon={<Users className="h-4 w-4" />}
            >
              <FamilyMembersManager />
            </UserButton.UserProfilePage>
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
