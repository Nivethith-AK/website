import { Client, Databases, Users, Storage, Account } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

const assertServerConfig = () => {
  if (!endpoint || !projectId || !apiKey) {
    throw new Error("Missing NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, or APPWRITE_API_KEY");
  }
};

export const createAppwriteServerClient = () => {
  assertServerConfig();
  const client = new Client()
    .setEndpoint(endpoint as string)
    .setProject(projectId as string)
    .setKey(apiKey as string);

  return {
    client,
    databases: new Databases(client),
    users: new Users(client),
    storage: new Storage(client),
    account: new Account(client),
  };
};

export const createAppwriteSessionClient = (sessionToken: string) => {
  assertServerConfig();
  const buildClient = () =>
    new Client()
      .setEndpoint(endpoint as string)
      .setProject(projectId as string);

  const token = (sessionToken || "").trim();
  const isLikelyJwt = token.split(".").length === 3;

  const client = buildClient();
  if (isLikelyJwt) {
    client.setJWT(token);
  } else {
    client.setSession(token);
  }

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
  };
};
