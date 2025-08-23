"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Recipe } from "../lib/mealPlanner";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-60 cursor-pointer">
          <CardHeader>
            <CardTitle>{recipe.title}</CardTitle>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <h2 className="text-lg font-medium mb-2">{recipe.title}</h2>
        <div>
          <h3 className="font-medium">Ingredients</h3>
          <ul className="list-disc pl-5 mb-2">
            {(recipe.ingredients || []).map((i: string, idx: number) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
          <h3 className="font-medium">Steps</h3>
          <ol className="list-decimal pl-5">
            {(recipe.steps || []).map((s: string, idx: number) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
