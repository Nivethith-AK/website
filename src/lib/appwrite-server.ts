import { Client, Databases, Users, Storage, Account } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

const fallbackEndpoint = "https://cloud.appwrite.io/v1";

export const createAppwriteServerClient = () => {
  const client = new Client()
    .setEndpoint(endpoint || fallbackEndpoint)
    .setProject(projectId || "placeholder")
    .setKey(apiKey || "placeholder");

  return {
    client,
    databases: new Databases(client),
    users: new Users(client),
    storage: new Storage(client),
    account: new Account(client),
  };
};

export const createAppwriteSessionClient = (sessionToken: string) => {
  const client = new Client()
    .setEndpoint(endpoint || fallbackEndpoint)
    .setProject(projectId || "placeholder")
    .setSession(sessionToken);

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
  };
};
