import { Query } from "node-appwrite";
import { appwriteDatabaseId, collections } from "@/lib/appwrite";
import { createAppwriteServerClient } from "@/lib/appwrite-server";

export const asArray = <T = any>(value: any): T[] => (Array.isArray(value) ? value : []);

export const uploadToBucket = async (_bucketOrPath: string, pathOrFile: string | File, maybeFile?: File) => {
  const file = (maybeFile || pathOrFile) as File;

  const server = createAppwriteServerClient();
  const stored = await server.storage.createFile(
    process.env.APPWRITE_STORAGE_BUCKET_ID || "",
    "unique()",
    file
  );

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
  const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || "";

  return `${endpoint}/storage/buckets/${bucketId}/files/${stored.$id}/view?project=${projectId}`;
};

export const getProfilesMap = async (ids: string[]) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, any>();
  if (!uniqueIds.length) return map;

  const server = createAppwriteServerClient();
  const list = await server.databases.listDocuments(
    appwriteDatabaseId,
    collections.profiles,
    [Query.equal("userId", uniqueIds), Query.limit(500)]
  );

  for (const doc of list.documents) {
    map.set(doc.userId, {
      id: doc.$id,
      email: doc.email,
      role: doc.role,
      firstName: doc.firstName || "",
      lastName: doc.lastName || "",
      companyName: doc.companyName || "",
      contactPerson: doc.contactPerson || "",
      industry: doc.industry || "",
    });
  }

  return map;
};

export const profileName = (profile: any) => {
  if (!profile) return "Unknown User";
  const person = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  return person || profile.companyName || profile.email || "Unknown User";
};
