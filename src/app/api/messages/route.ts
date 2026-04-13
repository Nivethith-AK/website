import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";
import { getProfilesMap, profileName, uploadToBucket } from "@/lib/supabase-utils";

const normalizeMessage = async (rows: any[]) => {
  const participantIds = rows.flatMap((row) => [row.sender_id, row.receiver_id]).filter(Boolean);
  const profiles = await getProfilesMap(participantIds);

  return rows.map((row) => {
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
};

export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["admin", "designer", "company"]);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .is("project_id", null)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const rows = data || [];
    const normalized = await normalizeMessage(rows);
    const convoMap = new Map<string, any>();

    for (const msg of normalized) {
      const senderId = msg.senderId?._id;
      const receiverId = msg.receiverId?._id;
      const partner = senderId === profile.id ? msg.receiverId : msg.senderId;
      const partnerId = partner?._id;
      if (!partnerId) continue;

      const current = convoMap.get(partnerId);
      if (!current) {
        convoMap.set(partnerId, {
          partner,
          lastMessage: msg.message || (msg.attachments?.length ? "Attachment" : ""),
          lastMessageAt: msg.createdAt,
          isFromMe: senderId === profile.id,
          unreadCount: receiverId === profile.id && !msg.isRead ? 1 : 0,
        });
      } else if (receiverId === profile.id && !msg.isRead) {
        current.unreadCount += 1;
      }
    }

    return NextResponse.json({ success: true, data: Array.from(convoMap.values()) });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["admin", "designer", "company"]);
    const supabase = getSupabaseAdmin();

    const contentType = req.headers.get("content-type") || "";
    let receiverId = "";
    let message = "";
    let attachments: Array<any> = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      receiverId = String(formData.get("receiverId") || "").trim();
      message = String(formData.get("message") || "").trim();
      const files = formData.getAll("attachments").filter(Boolean) as File[];

      for (const file of files) {
        const ext = (file.name.split(".").pop() || "bin").toLowerCase();
        const path = `messages/${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const fileUrl = await uploadToBucket("aurax-files", path, file);
        attachments.push({
          fileName: path.split("/").pop(),
          originalName: file.name,
          fileUrl,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
        });
      }
    } else {
      const body = await req.json();
      receiverId = String(body.receiverId || "").trim();
      message = String(body.message || "").trim();
      attachments = Array.isArray(body.attachments) ? body.attachments : [];
    }

    if (!receiverId || (!message && attachments.length === 0)) {
      return NextResponse.json({ success: false, message: "receiverId and message or attachment are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: profile.id,
        receiver_id: receiverId,
        message,
        attachments,
        is_read: false,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const [normalized] = await normalizeMessage([data]);
    return NextResponse.json({ success: true, data: normalized });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
