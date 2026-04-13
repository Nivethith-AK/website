import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req, ["admin"]);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const status = String(body.status || "").trim();

    if (!status) {
      return NextResponse.json({ success: false, message: "status is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("projects")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
