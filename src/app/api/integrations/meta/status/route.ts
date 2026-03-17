import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const META_GRAPH_API_VERSION = "v18.0";

/**
 * GET /api/integrations/meta/status
 * 
 * Returns the Meta (Facebook/Instagram) connection status for the current user.
 * Includes list of pages and access token status.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log("No session found");
      return NextResponse.json({ connected: false });
    }

    const user = session.user;
    console.log("Checking Meta connection for user:", user.id);

    // Check for Meta connection in user_metadata
    const metaConnection = user.user_metadata?.meta_connection;
    console.log("Meta connection in metadata:", !!metaConnection);
    
    if (metaConnection && metaConnection.connected_at) {
      console.log("Found Meta connection:", {
        hasToken: !!metaConnection.access_token,
        pagesCount: metaConnection.pages?.length || 0,
        selectedPageId: metaConnection.selected_page_id,
      });

      // Check if we need to refresh pages data
      let pages = metaConnection.pages || [];
      
      // If we have an access token, fetch fresh pages data from Graph API
      if (metaConnection.access_token) {
        try {
          const pagesResponse = await fetch(
            `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me/accounts?fields=id,name,access_token,instagram_business_account{id,name}&access_token=${metaConnection.access_token}`
          );
          const pagesData = await pagesResponse.json();
          
          if (pagesData.data) {
            pages = pagesData.data.map((page: any) => ({
              id: page.id,
              name: page.name,
              access_token: page.access_token,
              instagram_id: page.instagram_business_account?.id,
              instagram_name: page.instagram_business_account?.name,
            }));
            console.log("Refreshed pages from Graph API:", pages.length);
          }
        } catch (e) {
          console.log("Could not refresh pages from Graph API, using cached data");
        }
      }

      // Get selected page details
      const selectedPage = pages.find((p: any) => p.id === metaConnection.selected_page_id) || pages[0];
      const instagramPage = pages.find((p: any) => p.instagram_id);

      const result = {
        connected: true,
        facebook_user_id: metaConnection.facebook_user_id,
        facebook_name: metaConnection.facebook_name,
        pageName: selectedPage?.name,
        pageId: selectedPage?.id,
        pageAccessToken: selectedPage?.access_token,
        pages: pages,
        instagramConnected: !!instagramPage,
        instagramId: instagramPage?.instagram_id,
        instagramName: instagramPage?.instagram_name,
        hasValidToken: !!metaConnection.access_token,
      };

      console.log("Returning connected status:", result);
      return NextResponse.json(result);
    }

    // Check integrations table if no metadata found
    try {
      console.log("No metadata found, checking integrations table...");
      const response = await supabase
        .from("integrations")
        .select("provider, connected_account, status")
        .eq("user_id", user.id)
        .eq("provider", "meta")
        .single();

      if (response.data && response.data.status === "active") {
        const account = response.data.connected_account as any;
        console.log("Found connection in integrations table");
        return NextResponse.json({
          connected: true,
          pageName: account?.page_name,
          pageId: account?.page_id,
          pages: account?.pages || [],
          instagramConnected: account?.instagram_connected || false,
          instagramName: account?.instagram_name,
          hasValidToken: !!account?.access_token,
        });
      }
    } catch (e: any) {
      console.log("Integrations table query failed:", e.message);
    }

    console.log("No Meta connection found");
    return NextResponse.json({ connected: false });
  } catch (error: any) {
    console.error("Error checking Meta connection status:", error);
    return NextResponse.json({ connected: false });
  }
}
