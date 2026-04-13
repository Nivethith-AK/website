import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireAuth(req, ["admin"]);
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const designerIds = Array.isArray(body.designerIds) ? body.designerIds.filter(Boolean) : [];
    if (!designerIds.length) {
      return NextResponse.json({ success: false, message: "designerIds are required" }, { status: 400 });
    }

    if (body.requestId) {
      const { data: reqRow, error: reqError } = await supabase
        .from("client_requests")
        .select("*")
        .eq("id", body.requestId)
        .single();

      if (reqError || !reqRow) {
        return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
      }

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          client_request_id: reqRow.id,
          company_id: reqRow.company_id,
          project_title: reqRow.project_title,
          description: reqRow.description,
          status: "Active",
          budget: reqRow.budget,
          designer_ids: designerIds,
          participants: [reqRow.company_id, ...designerIds],
          chat_enabled: body.autoCreateChat !== false,
          created_by: profile.id,
        })
        .select("*")
        .single();

      if (projectError) {
        return NextResponse.json({ success: false, message: projectError.message }, { status: 400 });
      }

      await supabase
        .from("client_requests")
        .update({ status: "In Progress", assigned_designers: designerIds, updated_at: new Date().toISOString() })
        .eq("id", reqRow.id);

      return NextResponse.json({ success: true, data: project });
    }

    const companyId = String(body.companyId || "").trim();
    const projectTitle = String(body.projectTitle || "").trim();
    const description = String(body.description || "").trim();

    if (!companyId || !projectTitle) {
      return NextResponse.json({ success: false, message: "companyId and projectTitle are required" }, { status: 400 });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        company_id: companyId,
        project_title: projectTitle,
        description,
        status: "Active",
        budget: body.budget ? Number(body.budget) : null,
        designer_ids: designerIds,
        participants: [companyId, ...designerIds],
        chat_enabled: body.autoCreateChat !== false,
        created_by: profile.id,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
