import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * POST /api/account/delete
 *
 * Deletes the authenticated user's account from Supabase Auth.
 * Uses the service_role key to perform admin-level deletion.
 * The database cascade (ON DELETE CASCADE) handles cleanup of
 * profiles, doctor_settings, patients, and reports.
 */
export async function POST() {
  // Verify the user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { success: false, error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Create admin client with service_role key
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Explicitly clean up data tables before auth deletion (belt-and-suspenders with CASCADE)
  await adminClient.from("reports").delete().eq("doctor_id", user.id);
  await adminClient.from("patients").delete().eq("doctor_id", user.id);
  await adminClient.from("doctor_settings").delete().eq("id", user.id);
  await adminClient.from("profiles").delete().eq("id", user.id);

  // Hard delete from auth.users — shouldSoftDelete: false ensures the email
  // is freed up so the user can re-register without auth conflicts
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    user.id,
    false // shouldSoftDelete = false → hard delete
  );

  if (deleteError) {
    return NextResponse.json(
      { success: false, error: "Failed to delete account" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
