import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, ["admin"]);
    const { email } = await req.json();
    const targetEmail = String(email || "").trim().toLowerCase();

    if (!targetEmail) {
      return NextResponse.json({ success: false, message: "email is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: userRow, error: userError } = await supabase
      .from("profiles")
      .select("id,email,role")
      .eq("email", targetEmail)
      .single();

    if (userError || !userRow) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    await Promise.all([
      supabase.from("messages").delete().eq("sender_id", userRow.id),
      supabase.from("messages").delete().eq("receiver_id", userRow.id),
      supabase.from("client_requests").delete().eq("company_id", userRow.id),
      supabase.from("projects").delete().eq("company_id", userRow.id),
      supabase.from("profiles").delete().eq("id", userRow.id),
    ]);

    return NextResponse.json({ success: true, message: `Purged ${targetEmail}` });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
