import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { deleteUserByClerkId, upsertUserFromClerk } from "@/src/lib/users/sync";

export const runtime = "nodejs";

function getClerkWebhookSecret() {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "Missing CLERK_WEBHOOK_SECRET. Add it to your environment (.env.local)."
    );
  }
  return secret;
}

export async function POST(req: NextRequest) {
  let payload: string;
  try {
    payload = await req.text();
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const wh = new Webhook(getClerkWebhookSecret());

  type ClerkEmail = { id: string; email_address: string };
  type ClerkEvent = {
    type?: string;
    data?: {
      id?: string;
      email_address?: string;
      primary_email_address_id?: string;
      email_addresses?: ClerkEmail[];
    };
  };

  let evt: unknown;
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = (evt ?? {}) as ClerkEvent;

  // Extract Clerk user id and primary email
  const clerkUserId: string | undefined = data?.id;
  const primaryEmailId: string | undefined = data?.primary_email_address_id;
  const emailFromList: string | undefined = Array.isArray(data?.email_addresses)
    ? (data?.email_addresses?.find((e) => e?.id === primaryEmailId)?.email_address ?? data?.email_addresses?.[0]?.email_address)
    : undefined;
  const email: string | undefined = data?.email_address || emailFromList;

  try {
    switch (type) {
      case "user.created":
      case "user.updated": {
        if (!clerkUserId) break;
        await upsertUserFromClerk({ clerkUserId, email: email ?? null });
        break;
      }
      case "user.deleted": {
        if (!clerkUserId) break;
        await deleteUserByClerkId(clerkUserId);
        break;
      }
      default:
        // Ignore unrelated events but return 2xx
        break;
    }
  } catch (e) {
    // Log the error server-side; return 500 for processing errors
    console.error("Clerk webhook processing error", e);
    return new Response("Webhook processing error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
