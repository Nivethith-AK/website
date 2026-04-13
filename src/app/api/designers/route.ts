import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 24);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id,email,first_name,last_name,role,is_approved,experience_level,skills,profile_image,bio,availability,portfolio_items,fashion_projects,experience_entries"
      )
      .eq("role", "designer")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: (data || []).map((row: any) => ({
        _id: row.id,
        id: row.id,
        email: row.email,
        firstName: row.first_name || "",
        lastName: row.last_name || "",
        experienceLevel: row.experience_level || "Student",
        skills: Array.isArray(row.skills) ? row.skills : [],
        profileImage: row.profile_image || "",
        bio: row.bio || "",
        availability: row.availability || "Available",
        portfolio: Array.isArray(row.portfolio_items) ? row.portfolio_items : [],
        fashionProjects: Array.isArray(row.fashion_projects) ? row.fashion_projects : [],
        experiences: Array.isArray(row.experience_entries) ? row.experience_entries : [],
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
