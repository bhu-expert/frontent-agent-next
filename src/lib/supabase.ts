import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PROJECT_URL } from "@/config";

const SUPABASE_URL = SUPABASE_PROJECT_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Browser client - uses localStorage for session storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Creates a Supabase client for server-side (API routes) that reads session from cookies
 * @param cookieHeader - The cookie header from the request
 */
export function createServerClient(cookieHeader: string | null) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Set the session from the cookie
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map(c => {
        const [key, ...valueParts] = c.trim().split("=");
        return [key.trim(), valueParts.join("=")];
      })
    );

    // Find the auth token cookie (pattern: sb-{ref}-auth-token)
    const authTokenCookie = Object.entries(cookies).find(
      ([key]) => key.includes("auth-token") && !key.includes("refresh-token")
    );

    if (authTokenCookie) {
      try {
        const [, tokenValue] = authTokenCookie;
        const decoded = decodeURIComponent(tokenValue);
        const parsed = decoded.startsWith("base64-")
          ? JSON.parse(Buffer.from(decoded.slice(7), "base64").toString("utf-8"))
          : JSON.parse(decoded);
        
        const accessToken = parsed.access_token || parsed[0]?.access_token;
        if (accessToken) {
          supabase.auth.setSession({ access_token: accessToken, refresh_token: "" });
        }
      } catch {
        // Cookie parsing failed, continue without session
      }
    }
  }

  return supabase;
}
