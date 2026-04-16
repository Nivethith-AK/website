import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["admin", "designer", "company"]);
    const supabase = getSupabaseAdmin();

    let query = supabase.from("projects").select("id,project_title,status,chat_enabled,company_id,designer_ids,participants");

    if (profile.role === "admin") {
      query = query.order("created_at", { ascending: false }).limit(300);
    } else if (profile.role === "company") {
      query = query.eq("company_id", profile.id).order("created_at", { ascending: false }).limit(300);
    } else {
      query = query.contains("designer_ids", [profile.id]).order("created_at", { ascending: false }).limit(300);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: (data || []).map((row: any) => ({
        _id: row.id,
        projectTitle: row.project_title,
        status: row.status,
        chatEnabled: row.chat_enabled !== false,
      })),
    });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
