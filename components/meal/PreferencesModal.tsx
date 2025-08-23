"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PreferencesModal() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Preferences</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <h2 className="text-lg font-medium mb-3">Meal Preferences</h2>
        <form className="space-y-2">
          <Input placeholder="Dietary exclusions" />
          <Input placeholder="Cuisine preferences" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
