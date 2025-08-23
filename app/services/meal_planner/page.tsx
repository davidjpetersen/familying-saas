"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { WeeklyPlan } from "@/components/meal/WeeklyPlan";
import { ShoppingList } from "@/components/meal/ShoppingList";
import { PreferencesModal } from "@/components/meal/PreferencesModal";
import type { Recipe } from "@/lib/mealPlanner";

export default function MealPlannerPage() {
  const [plan, setPlan] = useState<Recipe[]>([]);
  const [list, setList] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch("/api/meal-plan?family_id=demo")
      .then((r) => r.json())
      .then((res) => setPlan(res.data?.plan || []));
    fetch("/api/shopping-list?family_id=demo")
      .then((r) => r.json())
      .then((res) => setList(res.data || {}));
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Meal Planner</h1>
        <PreferencesModal />
      </div>
      <p className="text-muted-foreground">Create weekly meal plans and shopping lists tailored to your family.</p>
      <section>
        <h2 className="font-medium mb-2">This Week</h2>
        <WeeklyPlan plan={plan} />
      </section>
      <section>
        <h2 className="font-medium mb-2">Shopping List</h2>
        <ShoppingList items={list} />
      </section>
      <Link href="/dashboard" className="text-sm text-primary underline">Back to dashboard</Link>
    </main>
  );
}
