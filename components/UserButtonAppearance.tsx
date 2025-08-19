"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";

export function UserButtonAppearance() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <UserButton.MenuItems>
        <UserButton.Action
          label="Appearance"
          labelIcon="settings"
          onClick={() => setOpen(true)}
        />
      </UserButton.MenuItems>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appearance</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <ThemeToggle />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
