import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["admin", "designer", "company"]);
    const supabase = getSupabaseAdmin();

    const { count, error } = await supabase
      .from("messages")
      .select("id", { head: true, count: "exact" })
      .eq("receiver_id", profile.id)
      .eq("is_read", false)
      .is("project_id", null);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: { unread: count || 0 } });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
