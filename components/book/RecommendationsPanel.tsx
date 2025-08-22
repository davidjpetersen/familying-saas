"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type Recommendation = {
  suggestion: string;
  rationale?: string;
  effort_level?: "low"|"medium"|"high";
  expected_timeline?: "immediate"|"days"|"weeks"|"months"|"ongoing";
};

export function RecommendationsPanel({ recs }: { recs: Recommendation[] }) {
  if (!recs?.length) return null;
  return (
    <div className="grid gap-4">
      {recs.map((r, i) => (
        <Card key={i} className="hover:shadow-md transition">
          <CardHeader className="flex items-center justify-between">
            <div className="font-medium">{r.suggestion}</div>
            <div className="flex gap-2">
              {r.effort_level && <Badge variant="secondary">{r.effort_level}</Badge>}
              {r.expected_timeline && <Badge>{r.expected_timeline}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {r.rationale && <p className="text-sm text-muted-foreground">{r.rationale}</p>}
            <div className="flex gap-2">
              <Button size="sm">Add to Plan</Button>
              <Button size="sm" variant="outline">Mark Tried</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}