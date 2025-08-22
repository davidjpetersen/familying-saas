"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Lock } from "lucide-react";

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

  // Render horizontal link menu
  const premium = plans?.find((p: any) => p.slug === 'familying_premium' || p.name?.toLowerCase().includes('premium'));
  const planFeatures: any[] = Array.isArray(premium?.features) ? premium.features : [];
  const enabledSet = new Set(userFeatures || []);
  const allEnabled = planFeatures.length > 0 && planFeatures.every((f) => enabledSet.has(f.slug || f.id || ''));

  return (
    <nav className="flex items-center gap-3 px-2 py-1">
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading plans…</div>
      ) : !premium ? (
        <div className="text-sm text-muted-foreground">No plans available</div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto">
          {planFeatures.map((f: any) => {
            const slug = f.slug ?? f.id;
            const enabled = enabledSet.has(slug);
            return (
              <Link key={slug} href={`/services/${slug}`} className={`text-sm px-3 py-1 rounded hover:bg-accent ${!enabled ? 'opacity-70' : ''}`}>
                {f.name}
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !allEnabled && (
        <Link href="/subscription" className="ml-4 px-3 py-1 bg-primary text-white rounded text-sm">Upgrade</Link>
      )}
    </nav>
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
