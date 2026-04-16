import { ID, Query } from "appwrite";
import { appwriteAccount, appwriteDatabases, appwriteDatabaseId, assertAppwriteConfig, collections } from "@/lib/appwrite";
import { sendVerificationEmail } from "./email";

export type AppRole = "admin" | "designer" | "company" | "user";

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role?: Exclude<AppRole, "admin">;
}

export const signUp = async (email: string, password: string, name: string, role: Exclude<AppRole, "admin"> = "user") => {
  assertAppwriteConfig();

  const normalizedEmail = email.trim().toLowerCase();
  const user = await appwriteAccount.create(ID.unique(), normalizedEmail, password, name);

  const profile = {
    userId: user.$id,
    name,
    email: normalizedEmail,
    role,
  };

  await appwriteDatabases.createDocument(
    appwriteDatabaseId,
    collections.profiles,
    user.$id,
    profile
  );

  try {
    await sendVerificationEmail(normalizedEmail, name);
  } catch (error) {
    console.error("Verification email failed:", error);
  }

  return user;
};

export const login = async (email: string, password: string) => {
  assertAppwriteConfig();
  return appwriteAccount.createEmailPasswordSession(email.trim().toLowerCase(), password);
};

export const logout = async () => {
  assertAppwriteConfig();
  return appwriteAccount.deleteSession("current");
};

export const getUser = async () => {
  assertAppwriteConfig();
  return appwriteAccount.get();
};

export const getProfileByUserId = async (userId: string) => {
  assertAppwriteConfig();
  const list = await appwriteDatabases.listDocuments(
    appwriteDatabaseId,
    collections.profiles,
    [Query.equal("userId", userId), Query.limit(1)]
  );
  return list.documents[0] || null;
};
