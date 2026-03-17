import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const META_GRAPH_API_VERSION = "v18.0";

/**
 * GET /api/integrations/meta/callback
 * 
 * Handles OAuth callback from Supabase after Facebook authentication.
 * Fetches user pages using Meta Graph API and stores connection data.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const provider = searchParams.get("provider") || "facebook";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const accessToken = searchParams.get("access_token");

  console.log("OAuth Callback received:", {
    hasCode: !!code,
    provider,
    hasError: !!error,
    hasAccessToken: !!accessToken,
  });

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL("/dashboard?tab=integrations&error=oauth_failed", request.url)
    );
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("No session found after OAuth callback");
      return NextResponse.redirect(
        new URL("/dashboard?tab=integrations&error=auth_failed", request.url)
      );
    }

    const user = session.user;
    console.log("User authenticated:", user.id, user.email);

    // Get the provider token from session or URL
    // Supabase may pass it in provider_token or we get it from URL
    let providerToken = session.provider_token || accessToken;

    console.log("Provider token available:", !!providerToken);

    // Fetch user's Facebook pages using Graph API
    let pages = [];
    let userFacebookId = null;
    let userName = null;

    if (providerToken) {
      try {
        console.log("Fetching Facebook user profile...");
        // Fetch user profile
        const userResponse = await fetch(
          `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me?fields=id,name&access_token=${providerToken}`
        );
        const userData = await userResponse.json();
        console.log("Facebook user data:", userData);
        
        userFacebookId = userData.id;
        userName = userData.name;

        console.log("Fetching Facebook pages...");
        // Fetch user's pages with required permissions
        const pagesResponse = await fetch(
          `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me/accounts?fields=id,name,access_token,permissions,instagram_business_account{id,name}&access_token=${providerToken}`
        );
        const pagesData = await pagesResponse.json();
        console.log("Facebook pages response:", pagesData);
        
        if (pagesData.data) {
          pages = pagesData.data.map((page: any) => ({
            id: page.id,
            name: page.name,
            access_token: page.access_token,
            permissions: page.permissions?.data || [],
            instagram_id: page.instagram_business_account?.id,
            instagram_name: page.instagram_business_account?.name,
          }));
          console.log("Processed pages:", pages.length);
        }
      } catch (graphError) {
        console.error("Error fetching Facebook pages:", graphError);
        // Continue without pages data - user can select later
      }
    } else {
      console.warn("No provider token available - limited functionality");
    }

    // Store connection data
    const metaConnection = {
      provider: provider,
      connected_at: new Date().toISOString(),
      user_id: user.id,
      facebook_user_id: userFacebookId,
      facebook_name: userName,
      access_token: providerToken,
      refresh_token: session.provider_refresh_token,
      pages: pages,
      selected_page_id: pages.length > 0 ? pages[0].id : null,
      instagram_connected: pages.some((p: any) => p.instagram_id),
      instagram_pages: pages.filter((p: any) => p.instagram_id),
    };

    console.log("Storing meta connection:", {
      hasToken: !!providerToken,
      pagesCount: pages.length,
      facebookId: userFacebookId,
    });

    // Store connection in user_metadata using service role
    const adminSupabase = SUPABASE_SERVICE_ROLE_KEY 
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : supabase;
    
    try {
      const updateResult = await adminSupabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...user.user_metadata,
            meta_connection: metaConnection,
          },
        }
      );
      console.log("User metadata updated:", updateResult);
    } catch (e: any) {
      console.error("Error updating user_metadata:", e.message);
    }

    // Try to save to integrations table if it exists
    try {
      const insertResult = await supabase.from("integrations").insert({
        user_id: user.id,
        provider: "meta",
        provider_account_id: userFacebookId || user.id,
        connected_account: metaConnection,
        status: "active",
        created_at: new Date().toISOString(),
      });
      console.log("Integrations table insert result:", insertResult);
    } catch (e: any) {
      console.log("Integrations table not found or insert failed:", e.message);
    }

    // Redirect back to integrations tab with success and pages data
    const redirectUrl = new URL("/dashboard?tab=integrations&connected=success", request.url);
    if (pages.length > 0) {
      redirectUrl.searchParams.set("pages_available", "true");
    }
    
    console.log("Redirecting to:", redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("Error processing OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/dashboard?tab=integrations&error=callback_failed", request.url)
    );
  }
}
