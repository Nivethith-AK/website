import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, mapProfileUser, requireAuth } from "@/lib/supabase-server";
import { getProfilesMap } from "@/lib/supabase-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req, ["admin"]);
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: userRow, error: userError } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (userError || !userRow) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const [reqRows, projRows, msgRows] = await Promise.all([
      supabase.from("client_requests").select("id,project_title,status,budget,created_at").eq("company_id", id).order("created_at", { ascending: false }).limit(100),
      supabase
        .from("projects")
        .select("id,project_title,status,created_at,company_id,designer_ids")
        .or(`company_id.eq.${id},designer_ids.cs.{${id}}`)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("messages")
        .select("id,message,created_at,sender_id,receiver_id")
        .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
        .order("created_at", { ascending: false })
        .limit(120),
    ]);

    const requests = (reqRows.data || []).map((row) => ({
      _id: row.id,
      projectTitle: row.project_title,
      status: row.status,
      budget: row.budget,
      createdAt: row.created_at,
    }));

    const projects = (projRows.data || []).map((row) => ({
      _id: row.id,
      projectTitle: row.project_title,
      status: row.status,
      createdAt: row.created_at,
    }));

    const profileIds = (msgRows.data || []).flatMap((row) => [row.sender_id, row.receiver_id]).filter(Boolean);
    const profileMap = await getProfilesMap(profileIds);

    const messages = (msgRows.data || []).map((row) => ({
      _id: row.id,
      message: row.message || "",
      createdAt: row.created_at,
      senderId: {
        name: `${profileMap.get(row.sender_id)?.first_name || ""} ${profileMap.get(row.sender_id)?.last_name || ""}`.trim(),
        email: profileMap.get(row.sender_id)?.email,
        role: profileMap.get(row.sender_id)?.role,
      },
      receiverId: {
        name: `${profileMap.get(row.receiver_id)?.first_name || ""} ${profileMap.get(row.receiver_id)?.last_name || ""}`.trim(),
        email: profileMap.get(row.receiver_id)?.email,
        role: profileMap.get(row.receiver_id)?.role,
      },
    }));

    const sentCount = (msgRows.data || []).filter((row) => row.sender_id === id).length;
    const receivedCount = (msgRows.data || []).filter((row) => row.receiver_id === id).length;

    return NextResponse.json({
      success: true,
      data: {
        user: mapProfileUser(userRow),
        requests,
        projects,
        messages,
        metrics: {
          sentCount,
          receivedCount,
        },
      },
    });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
