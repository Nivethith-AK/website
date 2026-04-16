import { Client, Account, Databases } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID;

export const hasAppwriteCoreConfig = Boolean(endpoint && projectId);
export const hasAppwriteDatabaseConfig = Boolean(databaseId);
export const hasAppwriteConfig = Boolean(hasAppwriteCoreConfig && hasAppwriteDatabaseConfig);

export const assertAppwriteCoreConfig = () => {
  if (!hasAppwriteCoreConfig) {
    throw new Error("Missing NEXT_PUBLIC_APPWRITE_ENDPOINT (or APPWRITE_ENDPOINT) or NEXT_PUBLIC_APPWRITE_PROJECT_ID (or APPWRITE_PROJECT_ID)");
  }
};

export const assertAppwriteConfig = () => {
  if (!hasAppwriteConfig) {
    throw new Error(
      "Missing NEXT_PUBLIC_APPWRITE_ENDPOINT (or APPWRITE_ENDPOINT), NEXT_PUBLIC_APPWRITE_PROJECT_ID (or APPWRITE_PROJECT_ID), or NEXT_PUBLIC_APPWRITE_DATABASE_ID (or APPWRITE_DATABASE_ID)"
    );
  }
};

const fallbackEndpoint = "https://cloud.appwrite.io/v1";
const fallbackProject = "placeholder";

const client = new Client()
  .setEndpoint(endpoint || fallbackEndpoint)
  .setProject(projectId || fallbackProject);

export const appwriteClient = client;
export const appwriteAccount = new Account(client);
export const appwriteDatabases = new Databases(client);
export const appwriteDatabaseId = databaseId || "";

export const collections = {
  profiles: "profiles",
  clientRequests: "client_requests",
  projects: "projects",
  messages: "messages",
  jobVacancies: "job_vacancies",
};
