import React from 'react'
import { getBookSummary } from '../../../../lib/supabase/bookSummaries'
import SummaryForm from '../../../../components/SummaryForm'
import ActivitySidebar from '../../../../components/ActivitySidebar'

type Params = { id: string };
export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const data = await getBookSummary(id);
  return (
    <main className="p-6 flex gap-6">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold mb-4">Edit Summary</h1>
        <SummaryForm initial={data} id={id} />
      </div>
      <ActivitySidebar summaryId={id} />
    </main>
  )
}
