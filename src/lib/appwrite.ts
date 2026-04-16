import { Client, Account, Databases } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID;

export const hasAppwriteConfig = Boolean(endpoint && projectId && databaseId);

export const assertAppwriteConfig = () => {
  if (!hasAppwriteConfig) {
    throw new Error(
      "Missing NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, or NEXT_PUBLIC_APPWRITE_DATABASE_ID"
    );
  }
};
assertAppwriteConfig();

const client = new Client()
  .setEndpoint(endpoint as string)
  .setProject(projectId as string);

export const appwriteClient = client;
export const appwriteAccount = new Account(client);
export const appwriteDatabases = new Databases(client);
export const appwriteDatabaseId = databaseId as string;

export const collections = {
  profiles: "profiles",
  clientRequests: "client_requests",
  projects: "projects",
  messages: "messages",
  jobVacancies: "job_vacancies",
};
