import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, mapProfileUser, requireAuth } from "@/lib/supabase-server";
import { asArray, uploadToBucket } from "@/lib/supabase-utils";

const mapResponse = (row: any) => ({
  _id: row.id,
  companyName: row.companyName || row.company_name || "",
  industry: row.industry || "",
  contactPerson: row.contactPerson || row.contact_person || "",
  phone: row.phone || "",
  website: row.website || "",
  address: row.address || "",
  description: row.description || row.bio || "",
  companyImage: row.companyImage || row.profile_image || "",
  portfolio: asArray(row.portfolio).length ? row.portfolio : asArray(row.portfolio_items),
});

export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["company"]);
    const formData = await req.formData();
    const file = formData.get("portfolioImage") as File | null;
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!file || !title) {
      return NextResponse.json({ success: false, message: "portfolioImage and title are required" }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `companies/${profile.id}/portfolio-${Date.now()}.${ext}`;
    const imageUrl = await uploadToBucket("aurax-files", path, file);

    const currentPortfolio = asArray(profile.portfolio_items);
    const nextPortfolio = [
      {
        image: imageUrl,
        title,
        description,
        uploadedAt: new Date().toISOString(),
      },
      ...currentPortfolio,
    ];

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .update({ portfolio_items: nextPortfolio, updated_at: new Date().toISOString() })
      .eq("id", profile.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: mapResponse(mapProfileUser(data)) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
