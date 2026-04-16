import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";
import { getProfilesMap } from "@/lib/supabase-utils";

const mapRequest = (row: any, company: any) => ({
  _id: row.id,
  projectTitle: row.project_title,
  description: row.description,
  requiredDesigners: row.required_designers,
  duration: row.duration,
  budget: row.budget,
  status: row.status,
  createdAt: row.created_at,
  company: company
    ? {
        _id: company.id,
        companyName: company.company_name || company.email,
        contactPerson: company.contact_person || "",
        email: company.email,
      }
    : undefined,
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["admin"]);
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = Number(searchParams.get("limit") || 200);

    let query = supabase.from("client_requests").select("*").order("created_at", { ascending: false }).limit(limit);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const rows = data || [];
    const companies = await getProfilesMap(rows.map((row: any) => row.company_id).filter(Boolean));

    return NextResponse.json({
      success: true,
      data: rows.map((row: any) => mapRequest(row, companies.get(row.company_id))),
    });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
