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
    const { user, profile } = await getAuthContext(req);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const email = String(user.email || "").trim().toLowerCase();
    const adminEmails = getAdminEmails();
    const shouldBeAdmin = !!email && adminEmails.includes(email);

    if (profile) {
      if (shouldBeAdmin && (profile.role !== "admin" || !profile.is_approved)) {
        const supabase = getSupabaseAdmin();
        const { data: updated, error: updateError } = await supabase
          .from("profiles")
          .update({ role: "admin", is_approved: true, rejection_reason: "", updated_at: new Date().toISOString() })
          .eq("id", user.id)
          .select("role,is_approved")
          .single();

        if (updateError) {
          return NextResponse.json({ success: false, message: updateError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: updated });
      }

      return NextResponse.json({
        success: true,
        data: {
          role: profile.role,
          is_approved: !!profile.is_approved,
        },
      });
    }

    const body = await req.json().catch(() => ({}));
    const meta = (user.user_metadata || {}) as Record<string, unknown>;
    const role = shouldBeAdmin ? "admin" : normalizeRole(body.role ?? meta.role);
    const effectiveEmail = email || String(body.email || "").trim().toLowerCase();

    if (!effectiveEmail) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const profilePayload = {
      id: user.id,
      email: effectiveEmail,
      role,
      is_approved: shouldBeAdmin,
      first_name: (body.firstName ?? meta.firstName ?? null) as string | null,
      last_name: (body.lastName ?? meta.lastName ?? null) as string | null,
      experience_level: (body.experienceLevel ?? meta.experienceLevel ?? null) as string | null,
      company_name: (body.companyName ?? meta.companyName ?? null) as string | null,
      contact_person: (body.contactPerson ?? meta.contactPerson ?? null) as string | null,
      phone: (body.phone ?? meta.phone ?? null) as string | null,
      address: (body.address ?? meta.address ?? null) as string | null,
      industry: (body.industry ?? meta.industry ?? null) as string | null,
    };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })
      .select("role,is_approved")
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
