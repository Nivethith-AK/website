import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const assertServerSupabaseConfig = () => {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
};

export const getSupabaseAdmin = () => {
  assertServerSupabaseConfig();
  return createClient(supabaseUrl as string, serviceRoleKey as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

const getBearerToken = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return "";
  return authHeader.slice(7).trim();
};

export const getAuthContext = async (req: NextRequest) => {
  const token = getBearerToken(req);
  if (!token) return { token: "", user: null, profile: null };

  const admin = getSupabaseAdmin();
  const { data: userData } = await admin.auth.getUser(token);
  const user = userData?.user ?? null;
  if (!user) return { token, user: null, profile: null };

  const { data: profile } = await admin
    .from("profiles")
    .select("id,email,role,is_approved,first_name,last_name,experience_level,company_name,contact_person,phone,address,industry,website,bio,availability,skills,profile_image,cv_file,portfolio_items,fashion_projects,experience_entries,rejection_reason")
    .eq("id", user.id)
    .single();

  return { token, user, profile: profile ?? null };
};

export const requireAuth = async (req: NextRequest, roles?: Array<"admin" | "designer" | "company">) => {
  const ctx = await getAuthContext(req);

  if (!ctx.user || !ctx.profile) {
    throw new Error("Unauthorized");
  }

  if (roles && !roles.includes(ctx.profile.role)) {
    throw new Error("Forbidden");
  }

  return ctx;
};

export const mapProfileUser = (row: any) => ({
  _id: row.id,
  id: row.id,
  name: `${row.first_name || ""} ${row.last_name || ""}`.trim() || row.company_name || row.email,
  email: row.email,
  role: row.role,
  isApproved: !!row.is_approved,
  isVerified: true,
  firstName: row.first_name || "",
  lastName: row.last_name || "",
  companyName: row.company_name || "",
  contactPerson: row.contact_person || "",
  industry: row.industry || "",
  website: row.website || "",
  phone: row.phone || "",
  address: row.address || "",
  bio: row.bio || "",
  experienceLevel: row.experience_level || "Student",
  availability: row.availability || "Available",
  skills: Array.isArray(row.skills) ? row.skills : [],
  profileImage: row.profile_image || "",
  cvFile: row.cv_file || "",
  portfolio: Array.isArray(row.portfolio_items) ? row.portfolio_items : [],
  portfolio_items: Array.isArray(row.portfolio_items) ? row.portfolio_items : [],
  experiences: Array.isArray(row.experience_entries) ? row.experience_entries : [],
  experience_entries: Array.isArray(row.experience_entries) ? row.experience_entries : [],
  fashionProjects: Array.isArray(row.fashion_projects) ? row.fashion_projects : [],
  fashion_projects: Array.isArray(row.fashion_projects) ? row.fashion_projects : [],
  rejectionReason: row.rejection_reason || "",
  rejection_reason: row.rejection_reason || "",
});
