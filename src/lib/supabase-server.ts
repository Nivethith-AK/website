import { Query } from "node-appwrite";
import type { NextRequest } from "next/server";
import { appwriteDatabaseId, collections } from "@/lib/appwrite";
import { createCompatClient } from "@/lib/appwrite-supabase-compat";
import { createAppwriteSessionClient } from "@/lib/appwrite-server";

const getBearerToken = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return "";
  return authHeader.slice(7).trim();
};

const normalizeProfile = (doc: any) => ({
  id: doc.$id,
  uid: doc.userId || doc.$id,
  email: doc.email,
  role: doc.role || "user",
  isApproved: doc.isApproved ?? (doc.role === "admin"),
  is_approved: doc.isApproved ?? (doc.role === "admin"),
  firstName: doc.firstName || "",
  first_name: doc.firstName || "",
  lastName: doc.lastName || "",
  last_name: doc.lastName || "",
  companyName: doc.companyName || "",
  company_name: doc.companyName || "",
  contactPerson: doc.contactPerson || "",
  contact_person: doc.contactPerson || "",
  industry: doc.industry || "",
  website: doc.website || "",
  phone: doc.phone || "",
  address: doc.address || "",
  bio: doc.bio || "",
  experienceLevel: doc.experienceLevel || "Student",
  experience_level: doc.experienceLevel || "Student",
  availability: doc.availability || "Available",
  skills: Array.isArray(doc.skills) ? doc.skills : [],
  profileImage: doc.profileImage || "",
  profile_image: doc.profileImage || "",
  cvFile: doc.cvFile || "",
  cv_file: doc.cvFile || "",
  portfolioItems: Array.isArray(doc.portfolioItems) ? doc.portfolioItems : [],
  portfolio_items: Array.isArray(doc.portfolioItems) ? doc.portfolioItems : [],
  experienceEntries: Array.isArray(doc.experienceEntries) ? doc.experienceEntries : [],
  experience_entries: Array.isArray(doc.experienceEntries) ? doc.experienceEntries : [],
  fashionProjects: Array.isArray(doc.fashionProjects) ? doc.fashionProjects : [],
  fashion_projects: Array.isArray(doc.fashionProjects) ? doc.fashionProjects : [],
  rejectionReason: doc.rejectionReason || "",
  rejection_reason: doc.rejectionReason || "",
  createdAt: doc.$createdAt || doc.createdAt || "",
  created_at: doc.$createdAt || doc.createdAt || "",
  updatedAt: doc.$updatedAt || doc.updatedAt || "",
  updated_at: doc.$updatedAt || doc.updatedAt || "",
});

export const getSupabaseAdmin = () => createCompatClient();

export const getAuthContext = async (req: NextRequest) => {
  const token = getBearerToken(req);
  if (!token) return { token: "", authUser: null, profile: null };

  try {
    const sessionClient = createAppwriteSessionClient(token);
    const authUser = await sessionClient.account.get();

    const profileList = await sessionClient.databases.listDocuments(
      appwriteDatabaseId,
      collections.profiles,
      [Query.equal("userId", authUser.$id), Query.limit(1)]
    );

    const profileDoc = profileList.documents[0] || null;
    const profile = profileDoc ? normalizeProfile(profileDoc) : null;
    return { token, authUser, profile };
  } catch {
    return { token, authUser: null, profile: null };
  }
};

export const requireAuth = async (
  req: NextRequest,
  roles?: Array<"admin" | "designer" | "company" | "user">
) => {
  const ctx = await getAuthContext(req);
  if (!ctx.authUser || !ctx.profile) {
    throw new Error("Unauthorized");
  }

  if (roles && !roles.includes(ctx.profile.role)) {
    throw new Error("Forbidden");
  }

  return {
    ...ctx,
    authUser: ctx.authUser,
    profile: ctx.profile,
  };
};

export const mapProfileUser = (row: any) => ({
  _id: row.id,
  id: row.id,
  name: `${row.firstName || ""} ${row.lastName || ""}`.trim() || row.companyName || row.email,
  email: row.email,
  role: row.role,
  isApproved: !!row.isApproved,
  isVerified: true,
  firstName: row.firstName || "",
  lastName: row.lastName || "",
  companyName: row.companyName || "",
  contactPerson: row.contactPerson || "",
  industry: row.industry || "",
  website: row.website || "",
  phone: row.phone || "",
  address: row.address || "",
  bio: row.bio || "",
  experienceLevel: row.experienceLevel || "Student",
  availability: row.availability || "Available",
  skills: Array.isArray(row.skills) ? row.skills : [],
  profileImage: row.profileImage || "",
  cvFile: row.cvFile || "",
  portfolio: Array.isArray(row.portfolioItems) ? row.portfolioItems : [],
  portfolio_items: Array.isArray(row.portfolioItems) ? row.portfolioItems : [],
  experiences: Array.isArray(row.experienceEntries) ? row.experienceEntries : [],
  experience_entries: Array.isArray(row.experienceEntries) ? row.experienceEntries : [],
  fashionProjects: Array.isArray(row.fashionProjects) ? row.fashionProjects : [],
  fashion_projects: Array.isArray(row.fashionProjects) ? row.fashionProjects : [],
  rejectionReason: row.rejectionReason || "",
  rejection_reason: row.rejectionReason || "",
});
