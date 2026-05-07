import { createClient } from "@/lib/supabase/server";

export interface AdminSession {
  userId: string;
  clientId: string;
}

/**
 * Verifies admin authentication and returns the session with clientId.
 * Returns null if unauthenticated or missing clientId.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const clientId = user.user_metadata?.clientId;
  if (!clientId || typeof clientId !== "string") return null;

  return { userId: user.id, clientId };
}
