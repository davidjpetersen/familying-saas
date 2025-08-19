export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-4 px-4 py-24 bg-gradient-to-b from-pink-50 to-white">
        <h1 className="text-4xl md:text-5xl font-bold">
          Feel like parenting should come with a manual?
        </h1>
        <p className="text-xl max-w-2xl">
          In 2 minutes, we’ll build your personalized parenting toolkit—based on
          your family’s real needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <a
            href="/quiz"
            className="rounded-md bg-pink-500 px-6 py-3 text-white font-semibold"
          >
            Start My Quiz
          </a>
          <a
            href="#how-it-works"
            className="rounded-md border px-6 py-3 font-semibold"
          >
            See How It Works
          </a>
        </div>
        <img
          src="https://placehold.co/300x600"
          alt="App preview"
          className="mt-10 rounded-md shadow-md"
        />
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-24 px-4 flex flex-col items-center gap-12 bg-white"
      >
        <h2 className="text-3xl font-bold">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-4xl">📝</span>
            <h3 className="font-semibold">Take the 2-minute quiz</h3>
          </div>
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-4xl">📊</span>
            <h3 className="font-semibold">Get your custom dashboard</h3>
          </div>
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-4xl">📚</span>
            <h3 className="font-semibold">
              Access tips, tools, and printable resources
            </h3>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-pink-50 flex flex-col items-center gap-12">
        <h2 className="text-3xl font-bold">Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
          <blockquote className="p-6 bg-white rounded-md shadow">
            "I felt so seen."
          </blockquote>
          <blockquote className="p-6 bg-white rounded-md shadow">
            "Finally, something for co-parents."
          </blockquote>
        </div>
      </section>

      {/* Free Preview */}
      <section className="py-24 px-4 flex flex-col items-center gap-8">
        <h2 className="text-3xl font-bold">Free Preview</h2>
        <p className="max-w-xl text-center">
          Peek at resources from your dashboard: meal planners, bedtime scripts,
          and story generators.
        </p>
        <a
          href="/free-toolkit"
          className="rounded-md bg-pink-500 px-6 py-3 text-white font-semibold"
        >
          Get Your Free Toolkit
        </a>
      </section>

      {/* What Makes Us Different */}
      <section className="py-24 px-4 bg-white flex flex-col items-center gap-8">
        <h2 className="text-3xl font-bold">What Makes Us Different</h2>
        <p className="max-w-3xl text-center">
          Evidence-based, playful, inclusive, and private—Familying is more than
          another parenting blog or AI tool.
        </p>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-4 bg-pink-50 flex flex-col items-center gap-8">
        <h2 className="text-3xl font-bold">Loved by Families Everywhere</h2>
        <p>Used by thousands of families across every kind of household.</p>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 flex flex-col items-center gap-6 bg-pink-500 text-white text-center">
        <h2 className="text-3xl font-bold">
          Start building the kind of family life you want
        </h2>
        <a
          href="/quiz"
          className="rounded-md bg-white text-pink-600 px-6 py-3 font-semibold"
        >
          Start My Quiz
        </a>
      </section>
    </main>
  );
}

