import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const CLERK_API_BASE = "https://api.clerk.com/v1";
const ALLOWED_EMAIL = process.env.ADMIN_EMAIL ?? "david.petersen@familying.org";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) {
    // Not signed in — send to home (or sign-in)
    redirect("/");
  }

  if (!process.env.CLERK_API_KEY) {
    // If we don't have the server key, deny access
    redirect("/dashboard");
  }

  try {
    const res = await fetch(`${CLERK_API_BASE}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("admin: clerk user lookup failed", await res.text());
      redirect("/dashboard");
    }

    const user = await res.json();
    // Clerk returns email addresses under `email_addresses` array
    const emails: string[] = (user?.email_addresses || []).map((e: any) => e?.email_address).filter(Boolean);
    const primary = emails[0] ?? null;

    if (primary !== ALLOWED_EMAIL) {
      // Not authorized
      redirect("/dashboard");
    }

    return (
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-muted-foreground mt-2">Welcome, you have access to admin-only tools.</p>

        <section className="mt-6">
          <h2 className="text-lg font-medium">Debug</h2>
          <pre className="bg-muted p-3 mt-2 rounded">{JSON.stringify({ userId, emails }, null, 2)}</pre>
        </section>
      </main>
    );
  } catch (err) {
    console.error("admin error", err);
    redirect("/dashboard");
  }
}
