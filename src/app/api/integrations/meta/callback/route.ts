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

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL("/dashboard?tab=integrations&error=oauth_failed", request.url)
    );
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get the session - Supabase should have already set the session cookie
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("No session found after OAuth callback");
      return NextResponse.redirect(
        new URL("/dashboard?tab=integrations&error=auth_failed", request.url)
      );
    }

    const user = session.user;

    // Get the provider token from session
    // Supabase stores provider tokens in the user's session
    const providerToken = session.provider_token;
    const providerRefreshToken = session.provider_refresh_token;

    if (!providerToken) {
      console.error("No Facebook access token found in session");
      // For now, we'll continue without the token, but in production you should handle this
      // The token should be available if Supabase is configured correctly
    }

    // Fetch user's Facebook pages using Graph API
    let pages = [];
    let userFacebookId = null;
    let userName = null;

    if (providerToken) {
      try {
        // Fetch user profile
        const userResponse = await fetch(
          `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me?fields=id,name&access_token=${providerToken}`
        );
        const userData = await userResponse.json();
        userFacebookId = userData.id;
        userName = userData.name;

        // Fetch user's pages with required permissions
        const pagesResponse = await fetch(
          `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me/accounts?fields=id,name,access_token,permissions,instagram_business_account{id,name}&access_token=${providerToken}`
        );
        const pagesData = await pagesResponse.json();
        
        if (pagesData.data) {
          pages = pagesData.data.map((page: any) => ({
            id: page.id,
            name: page.name,
            access_token: page.access_token,
            permissions: page.permissions?.data || [],
            instagram_id: page.instagram_business_account?.id,
            instagram_name: page.instagram_business_account?.name,
          }));
        }
      } catch (graphError) {
        console.error("Error fetching Facebook pages:", graphError);
        // Continue without pages data - user can select later
      }
    }

    // Store connection data
    const metaConnection = {
      provider: provider,
      connected_at: new Date().toISOString(),
      user_id: user.id,
      facebook_user_id: userFacebookId,
      facebook_name: userName,
      access_token: providerToken,
      refresh_token: providerRefreshToken,
      pages: pages,
      selected_page_id: pages.length > 0 ? pages[0].id : null,
      instagram_connected: pages.some((p: any) => p.instagram_id),
      instagram_pages: pages.filter((p: any) => p.instagram_id),
    };

    // Store connection in user_metadata using service role
    const adminSupabase = SUPABASE_SERVICE_ROLE_KEY 
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : supabase;
    
    try {
      await adminSupabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...user.user_metadata,
            meta_connection: metaConnection,
          },
        }
      );
    } catch (e) {
      console.error("Error updating user_metadata:", e);
    }

    // Try to save to integrations table if it exists
    try {
      await supabase.from("integrations").insert({
        user_id: user.id,
        provider: "meta",
        provider_account_id: userFacebookId || user.id,
        connected_account: metaConnection,
        status: "active",
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.log("Integrations table not found, using user_metadata only");
    }

    // Redirect back to integrations tab with success and pages data
    const redirectUrl = new URL("/dashboard?tab=integrations&connected=success", request.url);
    if (pages.length > 0) {
      redirectUrl.searchParams.set("pages_available", "true");
    }
    
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("Error processing OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/dashboard?tab=integrations&error=callback_failed", request.url)
    );
  }
}
