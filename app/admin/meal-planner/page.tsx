import Link from 'next/link'

export default function AdminMealPlannerPage() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Meal Planner</h1>
        <Link href="/services/meal_planner" className="btn">Preview service</Link>
      </div>
      <p className="text-sm text-muted-foreground">Configure and manage meal planning options, templates, and schedules.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded bg-background">
          <h2 className="font-medium">Settings</h2>
          <p className="text-sm text-muted-foreground mt-2">Add dietary defaults, plan durations, and constraints.</p>
        </div>
        <div className="p-4 border rounded bg-background">
          <h2 className="font-medium">Content</h2>
          <p className="text-sm text-muted-foreground mt-2">Manage recipe sources and curated weekly plans.</p>
        </div>
      </div>
    </main>
  )
}
