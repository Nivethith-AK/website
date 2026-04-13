import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["admin"]);
    const { receiverId, message } = await req.json();

    if (!receiverId || !String(message || "").trim()) {
      return NextResponse.json({ success: false, message: "receiverId and message are required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: profile.id,
        receiver_id: receiverId,
        message: String(message).trim(),
        is_read: false,
        attachments: [],
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
