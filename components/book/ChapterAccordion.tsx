"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Insight, InsightCard } from "./InsightCard";

export type Chapter = {
  chapter_number: number;
  title: string;
  summary: string;
  key_takeaways?: string[];
  insights?: Insight[];
  recommendations?: { suggestion: string; rationale?: string; effort_level?: "low"|"medium"|"high"; expected_timeline?: "immediate"|"days"|"weeks"|"months"|"ongoing" }[];
};

export function ChapterAccordion({ chapters, onSaveInsight }: { chapters: Chapter[]; onSaveInsight?: (id: string) => void }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {chapters.map((ch) => (
        <AccordionItem key={ch.chapter_number} value={`ch-${ch.chapter_number}`}>
          <AccordionTrigger>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm text-muted-foreground">Chapter {ch.chapter_number}</span>
              <span className="font-medium">{ch.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <p className="leading-relaxed">{ch.summary}</p>

            {ch.key_takeaways?.length ? (
              <div className="flex flex-wrap gap-1">
                {ch.key_takeaways.map((k, i) => (
                  <Badge key={`${ch.chapter_number}-kt-${i}`} variant="outline">{k}</Badge>
                ))}
              </div>
            ) : null}

            {ch.insights?.length ? (
              <div className="grid gap-3">
                {ch.insights.map((ins) => (
                  <InsightCard key={ins.id} insight={ins} onSave={onSaveInsight} />
                ))}
              </div>
            ) : null}

            {ch.recommendations?.length ? (
              <div className="space-y-2">
                <div className="text-sm font-medium">Recommendations</div>
                <ul className="list-disc pl-5 space-y-1">
                  {ch.recommendations.map((r, i) => (
                    <li key={`${ch.chapter_number}-rec-${i}`} className="text-sm">
                      <span className="font-medium">{r.suggestion}</span>
                      {r.rationale ? <span className="text-muted-foreground"> — {r.rationale}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}