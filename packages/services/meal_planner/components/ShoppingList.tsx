"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function ShoppingList({ items }: { items: Record<string, string[]> }) {
  return (
    <Accordion type="multiple" className="w-full">
      {Object.entries(items || {}).map(([aisle, list]) => (
        <AccordionItem key={aisle} value={aisle}>
          <AccordionTrigger>{aisle}</AccordionTrigger>
          <AccordionContent>
            <ul className="pl-4 space-y-1">
              {list.map((item: string, idx: number) => (
                <li key={idx} className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
