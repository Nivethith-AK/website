import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";
import { getProfilesMap, profileName } from "@/lib/supabase-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ partnerId: string }> }) {
  try {
    const { profile } = await requireAuth(req, ["admin", "designer", "company"]);
    const { partnerId } = await params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .is("project_id", null)
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${profile.id})`)
      .order("created_at", { ascending: true })
      .limit(400);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const rows = data || [];
    const profiles = await getProfilesMap(rows.flatMap((row) => [row.sender_id, row.receiver_id]).filter(Boolean));

    const mapped = rows.map((row) => {
      const sender = profiles.get(row.sender_id);
      const receiver = profiles.get(row.receiver_id);
      return {
        _id: row.id,
        senderId: {
          _id: row.sender_id,
          name: profileName(sender),
          email: sender?.email,
          role: sender?.role,
        },
        receiverId: {
          _id: row.receiver_id,
          name: profileName(receiver),
          email: receiver?.email,
          role: receiver?.role,
        },
        message: row.message || "",
        createdAt: row.created_at,
        isRead: !!row.is_read,
        readAt: row.read_at,
        attachments: Array.isArray(row.attachments) ? row.attachments : [],
      };
    });

    await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("receiver_id", profile.id)
      .eq("sender_id", partnerId)
      .eq("is_read", false)
      .is("project_id", null);

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
