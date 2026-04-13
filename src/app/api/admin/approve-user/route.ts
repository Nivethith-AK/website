import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest) {
  try {
    await requireAuth(req, ["admin"]);
    const { userId, isApproved, rejectionReason } = await req.json();

    if (!userId || typeof isApproved !== "boolean") {
      return NextResponse.json({ success: false, message: "userId and isApproved are required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("profiles")
      .update({
        is_approved: isApproved,
        rejection_reason: isApproved ? "" : String(rejectionReason || ""),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
