"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type EvidenceRef = {
  description?: string;
  source: string;
  type: "study" | "expert-opinion" | "case-study" | "book-reference";
};

export type Insight = {
  id: string;
  type: "tip"|"principle"|"strategy"|"warning"|"research-finding"|"quote";
  content: string;
  impact_score?: number;
  effort_level?: "low"|"medium"|"high";
  audience_tags?: string[];
  chapter_reference?: number;
  attribution?: string;
  context?: string;
  evidence_strength?: "strong"|"moderate"|"weak"|"anecdotal";
  evidence_references?: EvidenceRef[];
};

export function InsightCard({ insight, onSave }: { insight: Insight; onSave?: (id: string) => void }) {
  return (
    <Card className="hover:shadow-md transition">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="text-sm font-medium capitalize">{insight.type.replace("-", " ")}</div>
        <div className="flex gap-2">
          {insight.evidence_strength && (
            <Badge variant="secondary" className="capitalize">{insight.evidence_strength}</Badge>
          )}
          {typeof insight.impact_score === "number" && (
            <Badge>{Math.round(insight.impact_score * 100)}% impact</Badge>
          )}
          {insight.effort_level && <Badge variant="outline">{insight.effort_level}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="leading-relaxed">{insight.content}</p>
        {insight.attribution && <p className="text-xs text-muted-foreground">— {insight.attribution}</p>}
        {insight.audience_tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {insight.audience_tags.map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {insight.evidence_references?.length
            ? `${insight.evidence_references.length} source${insight.evidence_references.length>1?"s":""}`
            : "No sources"}
        </div>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => onSave?.(insight.id)}>Save</Button>
            </TooltipTrigger>
            <TooltipContent>Save to your notes</TooltipContent>
          </Tooltip>
          <Button size="sm">Details</Button>
        </div>
      </CardFooter>
    </Card>
  );
}