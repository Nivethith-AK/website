import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, mapProfileUser, requireAuth } from "@/lib/supabase-server";
import { uploadToBucket } from "@/lib/supabase-utils";

const mapResponse = (row: any) => ({
  _id: row.id,
  cvFile: row.cvFile || row.cv_file || "",
  profileImage: row.profileImage || row.profile_image || "",
});

export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["designer"]);
    const formData = await req.formData();
    const file = formData.get("cvFile") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "cvFile is required" }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
    const path = `designers/${profile.id}/cv-${Date.now()}.${ext}`;
    const fileUrl = await uploadToBucket("aurax-files", path, file);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .update({ cv_file: fileUrl, updated_at: new Date().toISOString() })
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
