import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { appwriteDatabaseId } from "@/lib/appwrite";
import { createAppwriteServerClient, getResolvedAppwriteServerEnv } from "@/lib/appwrite-server";

export async function GET() {
  const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || "";
  const resolved = getResolvedAppwriteServerEnv();

  try {
    const server = createAppwriteServerClient();

    await server.databases.listCollections(appwriteDatabaseId, [Query.limit(1)]);

    const storageCheck = bucketId
      ? await server.storage.getBucket(bucketId).then(() => true)
      : false;

    return NextResponse.json({
      success: true,
      data: {
        appwrite: {
          endpoint: resolved.endpoint || null,
          projectId: resolved.projectId || null,
          hasApiKey: resolved.hasApiKey,
          databaseId: appwriteDatabaseId,
          storageBucketId: bucketId || null,
          databaseReachable: true,
          storageReachable: storageCheck,
          checkedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Appwrite health check failed",
        data: {
          appwrite: {
            endpoint: resolved.endpoint || null,
            projectId: resolved.projectId || null,
            hasApiKey: resolved.hasApiKey,
            databaseId: appwriteDatabaseId,
            storageBucketId: bucketId || null,
            databaseReachable: false,
            storageReachable: false,
            checkedAt: new Date().toISOString(),
          },
        },
      },
      { status: 500 }
    );
  }
}
