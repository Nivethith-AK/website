import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const { user, profile } = await getAuthContext(req);

    if (!user || !profile) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.company_name || "User",
        email: profile.email || user.email,
        role: profile.role,
        isApproved: profile.is_approved,
        isVerified: !!user.email_confirmed_at,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
