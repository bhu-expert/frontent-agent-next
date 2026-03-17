import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const META_GRAPH_API_VERSION = "v18.0";

/**
 * POST /api/integrations/meta/callback
 * 
 * Handles OAuth data from client after Facebook authentication.
 * Client captures hash params and sends them here for processing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, refresh_token, expires_in } = body;

    console.log("OAuth POST callback received:", {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      expiresIn: expires_in,
    });

    if (!access_token) {
      return NextResponse.json(
        { error: "Access token required" },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get the session (should be set by client before calling this)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("No session found");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = session.user;
    console.log("User authenticated:", user.id, user.email);

    const providerToken = access_token;
    console.log("Provider token available:", !!providerToken);

    // Fetch user's Facebook pages using Graph API
    let pages = [];
    let userFacebookId = null;
    let userName = null;

    if (providerToken) {
      try {
        console.log("Fetching Facebook user profile...");
        const userResponse = await fetch(
          `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me?fields=id,name&access_token=${providerToken}`
        );
        const userData = await userResponse.json();
        console.log("Facebook user data:", userData);
        
        userFacebookId = userData.id;
        userName = userData.name;

        console.log("Fetching Facebook pages...");
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
      }
    }

    // Store connection data
    const metaConnection = {
      provider: "facebook",
      connected_at: new Date().toISOString(),
      user_id: user.id,
      facebook_user_id: userFacebookId,
      facebook_name: userName,
      access_token: providerToken,
      refresh_token: refresh_token,
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

    // Store in user_metadata
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
            provider: "facebook",
          },
        }
      );
      console.log("User metadata updated:", updateResult);
    } catch (e: any) {
      console.error("Error updating user_metadata:", e.message);
    }

    // Save to integrations table
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
      console.log("Integrations table insert failed:", e.message);
    }

    return NextResponse.json({
      success: true,
      pagesCount: pages.length,
      facebookId: userFacebookId,
    });
  } catch (error: any) {
    console.error("Error processing OAuth:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process OAuth" },
      { status: 500 }
    );
  }
}

// Keep GET for backwards compatibility
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");
  
  if (error) {
    return NextResponse.redirect(
      new URL("/dashboard?tab=integrations&error=oauth_failed", request.url)
    );
  }
  
  return NextResponse.redirect(
    new URL("/dashboard?tab=integrations", request.url)
  );
}
