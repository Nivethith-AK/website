import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, mapProfileUser, requireAuth } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["admin"]);

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const approval = searchParams.get("approval");
    const limit = Number(searchParams.get("limit") || 300);

    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (role) query = query.eq("role", role);
    if (approval === "approved") query = query.eq("is_approved", true);
    if (approval === "pending") query = query.eq("is_approved", false);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: (data || []).map(mapProfileUser) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
