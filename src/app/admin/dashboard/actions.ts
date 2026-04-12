"use server";

import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models/Profile";
import { revalidatePath } from "next/cache";

export async function toggleDesignerApproval(profileId: string, currentStatus: boolean) {
  await connectToDatabase();
  await Profile.findByIdAndUpdate(profileId, { isApproved: !currentStatus });
  revalidatePath("/admin/dashboard");
  revalidatePath("/designers");
}
