import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, getSupabaseAdmin } from "@/lib/supabase-server";

const normalizeRole = (value: unknown) => (value === "company" ? "company" : "designer");

const getAdminEmails = () => {
  const one = process.env.ADMIN_EMAIL || "";
  const many = process.env.ADMIN_EMAILS || "";

  return `${one},${many}`
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

export async function POST(req: NextRequest) {
  try {
    const { authUser, profile } = await getAuthContext(req);
    const currentProfile: any = profile;

    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const email = String(authUser.email || "").trim().toLowerCase();
    const adminEmails = getAdminEmails();
    const shouldBeAdmin = !!email && adminEmails.includes(email);

    if (currentProfile) {
      if (shouldBeAdmin && (currentProfile.role !== "admin" || !currentProfile.isApproved)) {
        const supabase = getSupabaseAdmin();
        const { data: updated, error: updateError } = await supabase
          .from("profiles")
          .update({ role: "admin", isApproved: true, rejectionReason: "", updatedAt: new Date().toISOString() })
          .eq("id", authUser.$id)
          .select("role,isApproved")
          .single();

        if (updateError) {
          return NextResponse.json({ success: false, message: updateError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: updated });
      }

      return NextResponse.json({
        success: true,
        data: {
          role: currentProfile.role,
          is_approved: !!currentProfile.isApproved,
        },
      });
    }

    const body = await req.json().catch(() => ({}));
    const meta = {} as Record<string, unknown>;
    const role = shouldBeAdmin ? "admin" : normalizeRole(body.role ?? meta.role);
    const effectiveEmail = email || String(body.email || "").trim().toLowerCase();

    if (!effectiveEmail) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const profilePayload = {
      id: authUser.$id,
      userId: authUser.$id,
      email: effectiveEmail,
      role,
      isApproved: shouldBeAdmin,
      firstName: (body.firstName ?? meta.firstName ?? "") as string,
      lastName: (body.lastName ?? meta.lastName ?? "") as string,
      experienceLevel: (body.experienceLevel ?? meta.experienceLevel ?? "Student") as string,
      companyName: (body.companyName ?? meta.companyName ?? "") as string,
      contactPerson: (body.contactPerson ?? meta.contactPerson ?? "") as string,
      phone: (body.phone ?? meta.phone ?? null) as string | null,
      address: (body.address ?? meta.address ?? null) as string | null,
      industry: (body.industry ?? meta.industry ?? null) as string | null,
    };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .upsert(profilePayload)
      .select("role,isApproved")
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
