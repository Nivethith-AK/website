import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, mapProfileUser, requireAuth } from "@/lib/supabase-server";

const mapCompanyProfile = (row: any) => ({
  _id: row.id,
  companyName: row.companyName || row.company_name || "",
  industry: row.industry || "",
  contactPerson: row.contactPerson || row.contact_person || "",
  phone: row.phone || "",
  website: row.website || "",
  address: row.address || "",
  description: row.description || row.bio || "",
  companyImage: row.companyImage || row.profileImage || row.profile_image || "",
  portfolio: Array.isArray(row.portfolio) ? row.portfolio : Array.isArray(row.portfolio_items) ? row.portfolio_items : [],
});

export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["company"]);
    return NextResponse.json({ success: true, data: mapCompanyProfile(mapProfileUser(profile)) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["company"]);
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const patch = {
      company_name: body.companyName ?? profile.company_name,
      industry: body.industry ?? profile.industry,
      contact_person: body.contactPerson ?? profile.contact_person,
      phone: body.phone ?? profile.phone,
      website: body.website ?? profile.website,
      address: body.address ?? profile.address,
      bio: body.description ?? profile.bio,
      profile_image: body.companyImage ?? profile.profile_image,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("profiles").update(patch).eq("id", profile.id).select("*").single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: mapCompanyProfile(mapProfileUser(data)) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
