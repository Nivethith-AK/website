import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

const toSkills = (skills: any) => {
  if (typeof skills === "string") {
    return skills.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return Array.isArray(skills) ? skills : [];
};

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req, ["admin"]);
    const { id } = await params;
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const patch = {
      title: String(body.title || "").trim(),
      description: String(body.description || "").trim(),
      location: String(body.location || "Remote").trim(),
      employment_type: String(body.employmentType || "Contract"),
      compensation: String(body.compensation || ""),
      skills: toSkills(body.skills),
      status: String(body.status || "Draft"),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("job_vacancies").update(patch).eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req, ["admin"]);
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("job_vacancies").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
