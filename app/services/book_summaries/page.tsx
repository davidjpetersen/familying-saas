import Link from "next/link";

export default function BookSummariesPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-3">Book Summaries</h1>
      <p className="text-muted-foreground mb-4">Short, kid-friendly summaries of popular books and stories.</p>
      <div className="space-x-2">
        <Link href="/dashboard" className="text-sm text-primary underline">Back to dashboard</Link>
      </div>
    </main>
  );
}
