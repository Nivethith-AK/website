import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, mapProfileUser, requireAuth } from "@/lib/supabase-server";

const mapDesignerProfile = (row: any) => ({
  _id: row.id,
  firstName: row.firstName || row.first_name || "",
  lastName: row.lastName || row.last_name || "",
  email: row.email || "",
  experienceLevel: row.experienceLevel || row.experience_level || "Student",
  skills: Array.isArray(row.skills) ? row.skills : [],
  profileImage: row.profileImage || row.profile_image || "",
  portfolio: Array.isArray(row.portfolio) ? row.portfolio : Array.isArray(row.portfolio_items) ? row.portfolio_items : [],
  cvFile: row.cvFile || row.cv_file || "",
  experiences: Array.isArray(row.experiences) ? row.experiences : Array.isArray(row.experience_entries) ? row.experience_entries : [],
  fashionProjects: Array.isArray(row.fashionProjects) ? row.fashionProjects : Array.isArray(row.fashion_projects) ? row.fashion_projects : [],
  bio: row.bio || "",
  availability: row.availability || "Available",
  isApproved: !!row.isApproved,
  assignedProjects: [],
});

export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["designer"]);
    return NextResponse.json({ success: true, data: mapDesignerProfile(mapProfileUser(profile)) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["designer"]);
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const patch = {
      first_name: body.firstName ?? profile.first_name,
      last_name: body.lastName ?? profile.last_name,
      skills: Array.isArray(body.skills) ? body.skills : profile.skills || [],
      experience_level: body.experienceLevel ?? profile.experience_level,
      bio: body.bio ?? profile.bio,
      availability: body.availability ?? profile.availability,
      experience_entries: Array.isArray(body.experiences) ? body.experiences : profile.experience_entries || [],
      fashion_projects: Array.isArray(body.fashionProjects) ? body.fashionProjects : profile.fashion_projects || [],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("profiles").update(patch).eq("id", profile.id).select("*").single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: mapDesignerProfile(mapProfileUser(data)) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
