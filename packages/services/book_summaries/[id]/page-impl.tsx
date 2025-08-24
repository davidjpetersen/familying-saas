"use client";

import React from "react";
import Link from "next/link";
import { ChapterAccordion } from "@/components/book/ChapterAccordion";
import { InsightCard, type Insight } from "@/components/book/InsightCard";
import { RecommendationsPanel } from "@/components/book/RecommendationsPanel";

const mockSummary = {
  id: "the-whole-brain-child",
  book: {
    title: "The Whole-Brain Child: 12 revolutionary strategies to nurture your child’s developing mind",
    authors: ["Daniel J. Siegel, MD", "Tina Payne Bryson, PhD"],
    publication_year: 2012,
    isbn: "9781921942495",
  },
  summary_glance: {
    overview:
      "The Whole-Brain Child provides practical strategies for parents to help children integrate their emotional and intellectual development.",
    who_should_read: "Parents, caregivers, and educators",
    key_takeaways: [
      "Help children name and process emotions.",
      "Use simple, repeatable strategies to promote brain integration.",
    ],
  },
  core_concepts: [
    {
      concept_name: "Integration",
      why_it_matters: "Integrating different brain functions supports emotional regulation and decision making.",
    },
  ],
  chapters: [
    {
      chapter_number: 1,
      title: "Two Brains Are Better Than One",
      summary: "Understanding left and right brain responses and how to bring them together.",
      key_points: ["Name the emotion", "Connect first, then redirect"],
    },
  ],
  insights: [
    { id: "ins-1", type: "tip", content: "When a child is dysregulated, connect with the feeling before trying to reason." },
  ],
  recommendations: [{ suggestion: "Practice a daily 'integration' check-in with your child." }],
  tags: ["Parenting", "Child Development"],
};

export default function BookSummaryDetailPage() {
  const summary = mockSummary;
  const sectionIds = [
    "overview",
    "who-should-read",
    "key-takeaways",
    "core-concepts",
    "insights",
    "chapters",
    "recommendations",
  ];

  const [active, setActive] = React.useState<string>(sectionIds[0]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActive(id);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{summary.book.title}</h1>
        <p className="text-muted-foreground">by {summary.book.authors.join(", ")}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_320px] gap-6">
        {/* Left nav */}
        <nav className="hidden lg:block">
          <div className="sticky top-20">
            <ul className="space-y-2">
              {sectionIds.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`block px-2 py-1 rounded ${
                      active === id ? "bg-accent text-accent-foreground font-medium" : "text-sm text-muted-foreground"
                    }`}
                  >
                    {id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <div>
          <section id="overview" className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Overview</h2>
            <p className="text-sm text-muted-foreground">{summary.summary_glance.overview}</p>
          </section>

          <section id="who-should-read" className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Who should read</h2>
            <p className="text-sm text-muted-foreground">{summary.summary_glance.who_should_read}</p>
          </section>

          <section id="key-takeaways" className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Key takeaways</h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {summary.summary_glance.key_takeaways.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </section>

          <section id="core-concepts" className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Core concepts</h2>
            <div className="space-y-4">
              {summary.core_concepts.map((c, idx) => (
                <div key={idx}>
                  <div className="font-medium">{c.concept_name}</div>
                  <div className="text-sm text-muted-foreground">{c.why_it_matters}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="insights" className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Insights</h2>
            <div className="grid gap-3">
              {(summary.insights as Insight[]).map((ins) => (
                <InsightCard key={ins.id} insight={ins} />
              ))}
            </div>
          </section>

          <section id="chapters" className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Chapters</h2>
            <ChapterAccordion chapters={summary.chapters} />
          </section>

          <section id="recommendations" className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Recommendations</h2>
            <RecommendationsPanel recs={summary.recommendations} />
          </section>

          <div className="mt-6">
            <Link href="/services/book_summaries" className="text-sm text-primary underline">
              Back to gallery
            </Link>
          </div>
        </div>

        {/* Right aside */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="p-4 rounded-md bg-muted">
              <div className="text-sm font-medium">About this book</div>
              <div className="text-xs text-muted-foreground mt-2">
                <div>Published: {summary.book.publication_year}</div>
                <div>ISBN: {summary.book.isbn}</div>
              </div>
            </div>

            <div className="p-4 rounded-md bg-muted">
              <div className="text-sm font-medium">Tags</div>
              <div className="text-xs text-muted-foreground mt-2">
                {summary.tags.map((t: string) => (
                  <span key={t} className="inline-block mr-2 text-xs">#{t}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
