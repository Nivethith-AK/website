import { getSupabaseAdmin } from "@/lib/supabase-server";

export const asArray = <T = any>(value: any): T[] => (Array.isArray(value) ? value : []);

export const toPublicUrl = (bucket: string, path: string) => {
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const uploadToBucket = async (bucket: string, path: string, file: File) => {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type || "application/octet-stream",
  });

  if (error) {
    throw new Error(error.message);
  }

  return toPublicUrl(bucket, path);
};

export const getProfilesMap = async (ids: string[]) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return new Map<string, any>();

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("id,email,role,is_approved,first_name,last_name,company_name,contact_person,industry")
    .in("id", uniqueIds);

  const map = new Map<string, any>();
  for (const row of data || []) {
    map.set(row.id, row);
  }
  return map;
};

export const profileName = (profile: any) => {
  if (!profile) return "Unknown User";
  const person = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  return person || profile.company_name || profile.email || "Unknown User";
};
