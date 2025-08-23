"use client";
import { RecipeCard } from "./RecipeCard";
import type { Recipe } from "@/lib/mealPlanner";

export function WeeklyPlan({ plan }: { plan: Recipe[] }) {
  return (
    <div className="flex space-x-4 overflow-x-auto py-2">
      {plan.map((recipe, idx) => (
        <RecipeCard key={idx} recipe={recipe} />
      ))}
    </div>
  );
}
