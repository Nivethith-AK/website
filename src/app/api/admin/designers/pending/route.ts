import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, mapProfileUser, requireAuth } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["admin"]);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "designer")
      .eq("is_approved", false)
      .order("created_at", { ascending: false })
      .limit(400);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: (data || []).map(mapProfileUser) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
