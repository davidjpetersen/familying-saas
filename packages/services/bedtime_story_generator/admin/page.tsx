import Link from 'next/link';

export default function BedtimeStoryGeneratorAdminPage() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Bedtime Story Generator</h1>
        <Link href="/services/bedtime_story_generator" className="btn">Preview service</Link>
      </div>
      <p className="text-sm text-muted-foreground">Configure and manage the Bedtime Story Generator experience.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded bg-background">
          <h2 className="font-medium">Settings</h2>
          <p className="text-sm text-muted-foreground mt-2">Add administrative settings here (e.g., feature flags, defaults, limits).</p>
        </div>
        <div className="p-4 border rounded bg-background">
          <h2 className="font-medium">Content</h2>
          <p className="text-sm text-muted-foreground mt-2">Manage prompts, themes, and curated templates.</p>
        </div>
      </div>
    </main>
  );
}
