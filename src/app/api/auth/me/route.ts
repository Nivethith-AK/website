import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const { authUser, profile } = await getAuthContext(req);

    if (!authUser || !profile) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.$id,
        name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.companyName || "User",
        email: profile.email || authUser.email,
        role: profile.role,
        isApproved: !!profile.isApproved,
        isVerified: !!authUser.emailVerification,
        createdAt: authUser.registration,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
