import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * DELETE /api/delete-account
 * 
 * Deletes the authenticated user's account and all associated data.
 * Requires password confirmation for security.
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Get the session from the request cookie
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = session.user;

    // Verify password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Use service role key to delete user (bypasses RLS)
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Delete user data from all tables (in case cascade delete is not enabled)
    // Order matters due to foreign key constraints
    
    // 1. Delete from saved_blogs
    await adminSupabase
      .from("saved_blogs")
      .delete()
      .eq("user_id", user.id);

    // 2. Delete from saved_images
    await adminSupabase
      .from("saved_images")
      .delete()
      .eq("user_id", user.id);

    // 3. Delete from api_keys
    await adminSupabase
      .from("api_keys")
      .delete()
      .eq("user_id", user.id);

    // 4. Delete from blog_categories
    await adminSupabase
      .from("blog_categories")
      .delete()
      .eq("user_id", user.id);

    // 5. Delete from post_queue
    await adminSupabase
      .from("post_queue")
      .delete()
      .eq("user_id", user.id);

    // 6. Delete from scraped_content_v2
    await adminSupabase
      .from("scraped_content_v2")
      .delete()
      .eq("user_id", user.id);

    // 7. Delete from brands (or set to null if they should remain public)
    await adminSupabase
      .from("brands")
      .delete()
      .eq("user_id", user.id);

    // 8. Delete from brand_scans
    await adminSupabase
      .from("brand_scans")
      .delete()
      .eq("user_id", user.id);

    // 9. Delete from scraper_results
    await adminSupabase
      .from("scraper_results")
      .delete()
      .eq("user_id", user.id);

    // 10. Finally, delete the user from Supabase Auth
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("Error deleting user from auth:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
