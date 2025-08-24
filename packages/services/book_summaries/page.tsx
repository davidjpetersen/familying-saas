import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';

type SummaryRow = {
	id: string;
	book?: { title?: string; author?: string; cover_url?: string } | null;
	metadata?: { thumbnail?: string } | null;
	status?: string | null;
	updated_at?: string | null;
};

// Server Component: fetches directly from Supabase with RLS via Clerk
export default async function GalleryPage() {
	const supabase = createSupabaseClient();
	let summaries: SummaryRow[] = [];

	try {
		const { data, error } = await supabase
			.from('book_summaries')
			.select('id,book,metadata,status,updated_at')
					// Only show published summaries
					.eq('status', 'published')
			.order('updated_at', { ascending: false })
			.limit(48);

		if (error) {
			console.error('Supabase error fetching published summaries', error);
		} else if (data) {
			summaries = data as SummaryRow[];
		}
	} catch (e) {
		console.error('Error fetching summaries', e);
	}

	return (
		<div className="max-w-7xl mx-auto px-4">
			<h1 className="text-2xl font-semibold mb-6">Book summaries</h1>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
				{summaries.length === 0 ? (
					<div className="col-span-full text-center text-sm text-muted-foreground">No published summaries yet.</div>
				) : (
					summaries.map((s) => {
						const title = s.book?.title ?? 'Untitled';
						const author = s.book?.author ?? '';
						const img = s.book?.cover_url ?? s.metadata?.thumbnail ?? `https://picsum.photos/seed/${encodeURIComponent(s.id)}/240/320`;

						return (
							<Link key={s.id} href={`/services/book_summaries/${s.id}`} className="group block">
								<div className="relative">
									<div className="aspect-[3/4] w-full overflow-hidden rounded shadow-sm bg-gray-100">
										<Image
											src={img}
											alt={title}
											fill
											sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
											className="object-cover transform group-hover:scale-105 transition"
										/>
									</div>
									<span className="absolute top-2 left-2 inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-green-600 text-white">{s.status === 'final' ? 'Published' : s.status === 'draft' ? 'Draft' : (s.status ?? 'Unknown')}</span>
								</div>

								<div className="mt-2 text-sm">
									<div className="font-medium">{title}</div>
									<div className="text-muted-foreground text-xs">{author}</div>
								</div>
							</Link>
						);
					})
				)}
			</div>
		</div>
	);
}
