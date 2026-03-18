import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PROJECT_URL } from "@/config";

const SUPABASE_URL = SUPABASE_PROJECT_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Configure Supabase client to use cookies for session storage
// This is required for API routes to access the session
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: "pkce",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        if (typeof window === "undefined") return null;
        try {
          return window.localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        if (typeof window === "undefined") return;
        try {
          window.localStorage.setItem(key, value);
        } catch {
          // ignore
        }
      },
      removeItem: (key) => {
        if (typeof window === "undefined") return;
        try {
          window.localStorage.removeItem(key);
        } catch {
          // ignore
        }
      },
    },
  },
  cookies: {
    get(name) {
      if (typeof document === "undefined") return;
      const match = document.cookie
        .split(";")
        .map(c => c.trim())
        .find(c => c.startsWith(`${name}=`));
      return match ? match.split("=")[1] : undefined;
    },
    set(name, value, options) {
      if (typeof document === "undefined") return;
      const maxAge = options?.maxAge ?? 60 * 60 * 24 * 365; // 1 year
      const path = options?.path ?? "/";
      const sameSite = options?.sameSite ?? "lax";
      const secure = options?.secure ?? false;
      document.cookie = `${name}=${value}; Max-Age=${maxAge}; Path=${path}; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
    },
    remove(name, options) {
      if (typeof document === "undefined") return;
      const path = options?.path ?? "/";
      document.cookie = `${name}=; Max-Age=0; Path=${path}`;
    },
  },
});
