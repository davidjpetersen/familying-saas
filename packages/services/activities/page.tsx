import Link from "next/link";

export default function ActivitiesPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-3">Activities</h1>
      <p className="text-muted-foreground mb-4">Activity ideas and step-by-step guides for family time.</p>
      <div className="space-x-2">
        <Link href="/dashboard" className="text-sm text-primary underline">Back to dashboard</Link>
      </div>
    </main>
  );
}
