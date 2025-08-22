import Link from 'next/link'

export default function AdminConversationStartersPage() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Conversation Starters</h1>
        <Link href="/services/conversation_starters" className="btn">Preview service</Link>
      </div>
      <p className="text-sm text-muted-foreground">Manage prompt libraries, categories, and safety filters.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded bg-background">
          <h2 className="font-medium">Settings</h2>
          <p className="text-sm text-muted-foreground mt-2">Toggle features, moderation, and visibility.</p>
        </div>
        <div className="p-4 border rounded bg-background">
          <h2 className="font-medium">Content</h2>
          <p className="text-sm text-muted-foreground mt-2">Create and curate categories and starter packs.</p>
        </div>
      </div>
    </main>
  )
}
