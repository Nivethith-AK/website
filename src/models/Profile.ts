import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProfile extends Document {
  user: mongoose.Types.ObjectId;
  skills: string[];
  experienceLevel: "student" | "intern" | "professional";
  portfolioUrls: string[];
  bio: string;
  isApproved: boolean;
  isAvailable: boolean;
  profileImage?: string;
}

const ProfileSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  skills: [{ type: String }],
  experienceLevel: { type: String, enum: ["student", "intern", "professional"], required: true },
  portfolioUrls: [{ type: String }],
  bio: { type: String, default: "" },
  isApproved: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  profileImage: { type: String },
});

export const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);
