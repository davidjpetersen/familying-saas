import Link from "next/link";

export default function BedtimeStoryGeneratorPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-3">Bedtime Story Generator</h1>
      <p className="text-muted-foreground mb-4">Generate cozy, personalized bedtime stories for your family.</p>
      <div className="space-x-2">
        <Link href="/dashboard" className="text-sm text-primary underline">Back to dashboard</Link>
      </div>
    </main>
  );
}
