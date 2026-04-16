import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";
import { getProfilesMap } from "@/lib/supabase-utils";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["admin"]);
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 300);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const rows = data || [];
    const profileIds = rows.flatMap((row: any) => [row.company_id, ...(Array.isArray(row.designer_ids) ? row.designer_ids : [])]).filter(Boolean);
    const profiles = await getProfilesMap(profileIds);

    return NextResponse.json({
      success: true,
      data: rows.map((row: any) => ({
        _id: row.id,
        projectTitle: row.project_title,
        budget: row.budget,
        status: row.status,
        chatEnabled: row.chat_enabled !== false,
        company: {
          _id: row.company_id,
          companyName: profiles.get(row.company_id)?.company_name || profiles.get(row.company_id)?.email || "Unknown Company",
        },
        designers: (Array.isArray(row.designer_ids) ? row.designer_ids : []).map((id: string) => ({
          designer: {
            _id: id,
            firstName: profiles.get(id)?.first_name || "",
            lastName: profiles.get(id)?.last_name || "",
          },
        })),
      })),
    });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
