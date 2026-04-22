import { createClient } from "npm:@supabase/supabase-js@2";

export const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

export async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: "No authorization header" };
  }

  const accessToken = authHeader.split(" ")[1];
  if (!accessToken) {
    return { user: null, error: "Invalid authorization header" };
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  return { user, error: null };
}
