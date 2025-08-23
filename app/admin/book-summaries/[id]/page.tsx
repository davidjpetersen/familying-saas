import React from 'react'
import { getBookSummary } from '../../../../lib/supabase/bookSummaries'
import SummaryForm from '../../../../components/SummaryForm'
import ActivitySidebar from '../../../../components/ActivitySidebar'

type Params = { id: string };
export default async function Page({ params }: { params: Params }) {
  const data = await getBookSummary(params.id);
  return (
    <main className="p-6 flex gap-6">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold mb-4">Edit Summary</h1>
  <SummaryForm initial={data} id={params.id} />
      </div>
      <ActivitySidebar summaryId={params.id} />
    </main>
  )
}
