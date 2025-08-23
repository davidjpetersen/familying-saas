"use client";

import * as React from "react";
import Link from "next/link";

// Consumes server endpoint that returns { plan, features }
type Feature = { id?: string; slug?: string; name?: string };
type Plan = { slug?: string; name?: string; features?: Feature[] };

export default function FeaturesNavMenu() {
  const [plans, setPlans] = React.useState<Plan[] | null>(null);
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
        setPlans(Array.isArray(plansRes?.data) ? (plansRes.data as Plan[]) : []);
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

  // Render horizontal link menu
  const premium = plans?.find((p) => p.slug === 'familying_premium' || p.name?.toLowerCase().includes('premium'));
  const planFeatures: Feature[] = Array.isArray(premium?.features) ? (premium.features as Feature[]) : [];
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
          {planFeatures.map((f) => {
            const slug = (f.slug ?? f.id ?? '') as string;
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
