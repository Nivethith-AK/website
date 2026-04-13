import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req, ["admin"]);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const companyId = String(body.companyId || "").trim();
    const designerIds = Array.isArray(body.designerIds) ? body.designerIds.filter(Boolean) : [];
    const chatEnabled = typeof body.chatEnabled === "boolean" ? body.chatEnabled : true;

    const participants = [companyId, ...designerIds].filter(Boolean);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("projects")
      .update({ designer_ids: designerIds, participants, chat_enabled: chatEnabled, updated_at: new Date().toISOString() })
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
