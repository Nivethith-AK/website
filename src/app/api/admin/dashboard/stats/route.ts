import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, requireAuth } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["admin"]);
    const supabase = getSupabaseAdmin();

    const [{ count: totalDesigners }, { count: pendingDesigners }, { count: totalCompanies }, { count: pendingCompanies }, { count: totalRequests }, { count: activeProjects }, { count: completedProjects }] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "designer"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "designer").eq("is_approved", false),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "company"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "company").eq("is_approved", false),
        supabase.from("client_requests").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "Active"),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "Completed"),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalDesigners: totalDesigners || 0,
        pendingDesigners: pendingDesigners || 0,
        pendingCompanies: pendingCompanies || 0,
        totalCompanies: totalCompanies || 0,
        totalRequests: totalRequests || 0,
        activeProjects: activeProjects || 0,
        completedProjects: completedProjects || 0,
      },
    });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status });
  }
}
