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
    .select("id,email,role,is_approved,first_name,last_name,experience_level,company_name,contact_person,phone,address,industry,bio,availability,skills,profile_image,cv_file")
    .eq("id", user.id)
    .single();

  return { token, user, profile: profile ?? null };
};
