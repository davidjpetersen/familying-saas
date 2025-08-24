import Link from 'next/link';

export default function SoundscapesAdminPage() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Soundscapes</h1>
        <Link href="/soundscapes" className="btn">Preview service</Link>
      </div>
      <p className="text-sm text-muted-foreground">Manage ambient audio tracks and categories.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded bg-background">
          <h2 className="font-medium">Library</h2>
          <p className="text-sm text-muted-foreground mt-2">Upload sounds, thumbnails, and metadata.</p>
        </div>
        <div className="p-4 border rounded bg-background">
          <h2 className="font-medium">Settings</h2>
          <p className="text-sm text-muted-foreground mt-2">Configure categories and publish status.</p>
        </div>
      </div>
    </main>
  );
}
