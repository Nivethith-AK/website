import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

const mapRequest = (row: any) => ({
  _id: row.id,
  projectTitle: row.project_title,
  description: row.description,
  requiredDesigners: row.required_designers,
  duration: row.duration,
  budget: row.budget,
  status: row.status,
  createdAt: row.created_at,
  assignedDesigners: Array.isArray(row.assigned_designers) ? row.assigned_designers : [],
  isPublic: !!row.is_public,
});

export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["company"]);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("client_requests")
      .select("*")
      .eq("company_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: (data || []).map(mapRequest) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["company"]);
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const payload = {
      company_id: profile.id,
      project_title: String(body.projectTitle || "").trim(),
      description: String(body.description || "").trim(),
      required_designers: Number(body.requiredDesigners || 1),
      duration: String(body.duration || "1 month"),
      budget: body.budget ? Number(body.budget) : null,
      required_skills: Array.isArray(body.requiredSkills) ? body.requiredSkills : [],
      preferred_experience: String(body.preferredExperience || "Any"),
      is_public: !!body.isPublic,
      status: "New",
      assigned_designers: [],
    };

    if (!payload.project_title || !payload.description) {
      return NextResponse.json({ success: false, message: "Project title and description are required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("client_requests").insert(payload).select("*").single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: mapRequest(data) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
