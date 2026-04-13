import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

const mapVacancy = (row: any) => ({
  _id: row.id,
  title: row.title,
  description: row.description,
  location: row.location || "Remote",
  employmentType: row.employment_type || "Contract",
  compensation: row.compensation || "",
  skills: Array.isArray(row.skills) ? row.skills : [],
  status: row.status,
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["admin"]);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.from("job_vacancies").select("*").order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: (data || []).map(mapVacancy) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["admin"]);
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const payload = {
      title: String(body.title || "").trim(),
      description: String(body.description || "").trim(),
      location: String(body.location || "Remote").trim(),
      employment_type: String(body.employmentType || "Contract"),
      compensation: String(body.compensation || ""),
      skills: typeof body.skills === "string" ? body.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : Array.isArray(body.skills) ? body.skills : [],
      status: String(body.status || "Draft"),
      created_by: profile.id,
    };

    if (!payload.title || !payload.description) {
      return NextResponse.json({ success: false, message: "title and description are required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("job_vacancies").insert(payload).select("*").single();
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: mapVacancy(data) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
