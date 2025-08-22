"use client";

import React from "react";
import Link from "next/link";
import { ChapterAccordion } from "@/components/book/ChapterAccordion";
import { InsightCard, type Insight } from "@/components/book/InsightCard";
import { RecommendationsPanel } from "@/components/book/RecommendationsPanel";

const summary = {
  id: "the-whole-brain-child",
  schema_version: "3.3.0",
  status: "final",
  book: {
    title: "The Whole-Brain Child: 12 revolutionary strategies to nurture your child’s developing mind",
    authors: ["Daniel J. Siegel, MD and Tina Payne Bryson, PhD"],
    publication_year: 2012,
    isbn: "9781921942495"
  },
  metadata: {
    target_audience: "Parents and caregivers",
    primary_challenge: "The book addresses the challenge of helping children manage emotions and behaviors effectively.",
    age_focus: ["0-2","3-5","6-11","12+"],
    difficulty_level: "moderate"
  },
  summary_glance: {
    overview: "The Whole-Brain Child provides strategies for parents to nurture their child's developing mind by integrating the different parts of the brain to promote emotional and mental well-being.",
    who_should_read: "Parents and caregivers",
    key_takeaways: ["Parents can use everyday interactions, even challenging ones, as opportunities to help their children thrive by fostering brain integration."]
  },
  core: {
    central_message: "The book argues that understanding and integrating the different parts of a child's brain can help parents raise happier, healthier, and more resilient children.",
    evidence_quality: "moderate"
  },
  core_concepts: [
    {
      concept_name: "Integration of the Brain",
      why_it_matters: "Integration involves linking different parts of the brain to work together as a whole, allowing for balanced and coordinated functioning.",
      common_misconception: "Parents might struggle with their own understanding of brain integration and how to effectively apply it in high-stress situations with their children.",
      quick_application: "Parents can help their children integrate their brains by encouraging them to express their emotions and thoughts, and by guiding them through difficult experiences to help them understand and process their feelings."
    }
  ],
  chapters: [
    {
      chapter_number: 6,
      title: "Chapter 6: THE ME-WE CONNECTION: Integrating Self and Other",
      summary: "Integrating individual and family needs through fun and mindful conflict resolution fosters a thriving family environment.",
      key_points: ["The importance of balancing individual needs with family dynamics.", "Whole-Brain Strategy #11 focuses on increasing family enjoyment and connection.", "Whole-Brain Strategy #12 emphasizes resolving conflicts with a collective mindset."],
      recommendations: [
        { suggestion: "Make intentional efforts to create fun and enjoyable family experiences." },
        { suggestion: "Teach children to approach conflicts with consideration for others’ perspectives." }
      ]
    }
  ],
  insights: [
    { id: 'i1', type: 'tip', content: 'Use reflective listening to help a child label emotions.', impact_score: 0.7, effort_level: 'low' }
  ],
  recommendations: [
    { suggestion: 'Understand the concept of integration in the brain.' },
    { suggestion: 'Learn about the different parts of the brain and their functions.' }
  ]
  ,
  tags: ['Parenting']
};

export default function BookSummariesPage() {
  const sectionIds = [
    'overview',
    'who-should-read',
    'key-takeaways',
    'core-concepts',
    'insights',
    'chapters',
    'recommendations'
  ];

  const [active, setActive] = React.useState<string>('overview');

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-3">{summary.book.title}</h1>
      <p className="text-muted-foreground mb-6">by {Array.isArray(summary.book.authors) ? summary.book.authors.join(', ') : summary.book.authors}</p>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_320px] gap-6">
        {/* Left: scroll-spy menu */}
        <nav className="hidden lg:block">
          <div className="sticky top-20">
            <ul className="space-y-2">
              {sectionIds.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`block px-2 py-1 rounded ${active === id ? 'bg-accent text-accent-foreground font-medium' : 'text-sm text-muted-foreground'}`}>
                    {id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Middle: content */}
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
              {(summary.summary_glance.key_takeaways || []).map((k: string, idx: number) => <li key={idx}>{k}</li>)}
            </ul>
          </section>

          <section id="core-concepts" className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Core concepts</h2>
            <div className="space-y-4">
              {(summary.core_concepts || []).map((c: any, idx: number) => (
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
              {((summary.insights || []) as Insight[]).map((ins: Insight) => (
                <InsightCard key={ins.id} insight={ins} />
              ))}
            </div>
          </section>

          <section id="chapters" className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Chapters</h2>
            <ChapterAccordion chapters={summary.chapters ?? []} />
          </section>

          <section id="recommendations" className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Recommendations</h2>
            <RecommendationsPanel recs={summary.recommendations ?? []} />
          </section>

          <div className="mt-6">
            <Link href="/services" className="text-sm text-primary underline">Back to services</Link>
          </div>
        </div>

        {/* Right: placeholder / related */}
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
                {(summary.tags || ['Parenting']).map((t: string) => (
                  <div key={t} className="inline-block mr-2 text-xs">#{t}</div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
