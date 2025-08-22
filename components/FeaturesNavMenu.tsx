"use client";

import * as React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { List, Check, Lock } from "lucide-react";

// Consumes server endpoint that returns { plan, features }
export default function FeaturesNavMenu() {
  const [plans, setPlans] = React.useState<any[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [userFeatures, setUserFeatures] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch('/api/commerce/plans').then((r) => r.json()).catch(() => ({})),
      fetch('/api/features').then((r) => r.json()).catch(() => ({ plan: 'Free', features: [] })),
    ])
      .then(([plansRes, featuresRes]) => {
        if (!mounted) return;
        setPlans(Array.isArray(plansRes?.data) ? plansRes.data : []);
        setUserFeatures(Array.isArray(featuresRes?.features) ? featuresRes.features : []);
      })
      .catch(() => {
        if (!mounted) return;
        setPlans([]);
        setUserFeatures([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  function humanLabel(key: string) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-accent">
          <List className="h-4 w-4" />
          <span className="text-sm">Features</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0">
        {loading ? (
          <div className="p-2 text-sm text-muted-foreground">Loading plans…</div>
        ) : (
          (() => {
            const premium = plans?.find((p: any) => p.slug === 'familying_premium' || p.name?.toLowerCase().includes('premium'));
            if (!premium) return <div className="p-2 text-sm text-muted-foreground">No plans available</div>;

            const planFeatures: any[] = Array.isArray(premium.features) ? premium.features : [];
            const enabledSet = new Set(userFeatures || []);
            const allEnabled = planFeatures.length > 0 && planFeatures.every((f) => enabledSet.has(f.slug || f.id || ''));

            // Two-column grid layout for features (matches the NavigationMenu example)
            return (
              <div className="p-4">

                <div className="px-2 py-3">
                  {planFeatures.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No features</div>
                  ) : (
                    <ul className="grid w-[250px] gap-2">
                      {planFeatures.map((f: any) => {
                        const slug = f.slug ?? f.id;
                        const enabled = enabledSet.has(slug);
                        return (
                          <li key={f.id}>
                            <ListItem href={`/services/${slug}`} title={f.name} enabled={enabled} subtle={!enabled}></ListItem>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="pt-3">
                    {!allEnabled && (
                      <Link href="/subscription" className="block w-full text-center rounded bg-primary px-3 py-3 text-white">
                        Upgrade to unlock all features
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ListItem({ href, title, children, subtle, enabled }: { href: string; title: string; children?: React.ReactNode; subtle?: boolean; enabled?: boolean }) {
  return (
    <Link href={href} className="block w-full">
      <div className={`rounded-md p-3 hover:bg-accent/50 ${subtle ? 'opacity-70' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="flex-none">
            {enabled ? <Check className="size-4 text-green-500" /> : <Lock className="size-4 text-muted-foreground" />}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{title}</div>
            {children ? <div className="text-xs text-muted-foreground mt-1 leading-tight">{children}</div> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
