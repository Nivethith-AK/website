import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";
import { getProfilesMap, profileName, uploadToBucket } from "@/lib/supabase-utils";

const isParticipant = (project: any, userId: string, role: string) => {
  if (role === "admin") return true;
  if (project.company_id === userId) return true;
  const designers = Array.isArray(project.designer_ids) ? project.designer_ids : [];
  if (designers.includes(userId)) return true;
  const participants = Array.isArray(project.participants) ? project.participants : [];
  return participants.includes(userId);
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await requireAuth(req, ["admin", "designer", "company"]);
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id,company_id,designer_ids,participants,chat_enabled")
      .eq("id", id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    if (!isParticipant(project, profile.id, profile.role)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const rows = data || [];
    const profiles = await getProfilesMap(rows.map((row: any) => row.sender_id).filter(Boolean));

    return NextResponse.json({
      success: true,
      data: rows.map((row: any) => {
        const sender = profiles.get(row.sender_id);
        return {
          _id: row.id,
          message: row.message || "",
          createdAt: row.created_at,
          attachments: Array.isArray(row.attachments) ? row.attachments : [],
          senderId: {
            _id: row.sender_id,
            name: profileName(sender),
            email: sender?.email,
            role: sender?.role,
          },
        };
      }),
    });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await requireAuth(req, ["admin", "designer", "company"]);
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id,company_id,designer_ids,participants,chat_enabled")
      .eq("id", id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    if (!isParticipant(project, profile.id, profile.role)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (project.chat_enabled === false) {
      return NextResponse.json({ success: false, message: "Project chat is disabled" }, { status: 400 });
    }

    const contentType = req.headers.get("content-type") || "";
    let message = "";
    let attachments: Array<any> = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      message = String(formData.get("message") || "").trim();
      const files = formData.getAll("attachments").filter(Boolean) as File[];
      for (const file of files) {
        const ext = (file.name.split(".").pop() || "bin").toLowerCase();
        const path = `project-chats/${id}/${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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
      const body = await req.json().catch(() => ({}));
      message = String(body.message || "").trim();
      attachments = Array.isArray(body.attachments) ? body.attachments : [];
    }

    if (!message && attachments.length === 0) {
      return NextResponse.json({ success: false, message: "Message text or attachment is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: profile.id,
        receiver_id: null,
        project_id: id,
        message,
        attachments,
        is_read: true,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: data.id,
        message: data.message || "",
        createdAt: data.created_at,
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        senderId: {
          _id: profile.id,
          name: profileName(profile),
          email: profile.email,
          role: profile.role,
        },
      },
    });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
