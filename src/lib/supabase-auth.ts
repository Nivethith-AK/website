import { assertSupabaseConfig, supabase } from "@/lib/supabase";

export type AppRole = "admin" | "designer" | "company";

interface RegisterPayload {
  role: Exclude<AppRole, "admin">;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  experienceLevel?: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  industry?: string;
}

export const signUpWithProfile = async (payload: RegisterPayload) => {
  assertSupabaseConfig();

  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    options: {
      data: {
        role: payload.role,
        firstName: payload.firstName ?? null,
        lastName: payload.lastName ?? null,
        experienceLevel: payload.experienceLevel ?? null,
        companyName: payload.companyName ?? null,
        contactPerson: payload.contactPerson ?? null,
        phone: payload.phone ?? null,
        address: payload.address ?? null,
        industry: payload.industry ?? null,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;
  if (!userId) {
    return { needsEmailVerification: true };
  }

  const profilePayload = {
    id: userId,
    email: payload.email.trim().toLowerCase(),
    role: payload.role,
    is_approved: false,
    first_name: payload.firstName ?? null,
    last_name: payload.lastName ?? null,
    experience_level: payload.experienceLevel ?? null,
    company_name: payload.companyName ?? null,
    contact_person: payload.contactPerson ?? null,
    phone: payload.phone ?? null,
    address: payload.address ?? null,
    industry: payload.industry ?? null,
  };

  const { error: profileError } = await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" });
  if (profileError) {
    const message = profileError.message.toLowerCase();
    const policyBlocked =
      message.includes("row-level security") ||
      message.includes("permission denied") ||
      message.includes("new row violates row-level security policy");

    if (!policyBlocked) {
      throw new Error(profileError.message);
    }
  }

  return { needsEmailVerification: true };
};

export const signInWithRole = async (email: string, password: string) => {
  assertSupabaseConfig();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;
  if (!userId) {
    throw new Error("Unable to load your account");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,is_approved")
    .eq("id", userId)
    .single();

  if (profileError) {
    throw new Error("Profile not found. Please contact admin.");
  }

  if (!profile.is_approved && profile.role !== "admin") {
    throw new Error("Your account is pending admin approval");
  }

  return {
    role: profile.role as AppRole,
    accessToken: data.session?.access_token ?? "",
  };
};
