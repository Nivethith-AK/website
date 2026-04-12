import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectRequest extends Document {
  client: mongoose.Types.ObjectId;
  title: string;
  description: string;
  designersNeeded: number;
  duration: string;
  budget?: string;
  status: "pending" | "active" | "completed";
  assignedDesigners: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ProjectRequestSchema: Schema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  designersNeeded: { type: Number, required: true },
  duration: { type: String, required: true },
  budget: { type: String },
  status: { type: String, enum: ["pending", "active", "completed"], default: "pending" },
  assignedDesigners: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export const ProjectRequest: Model<IProjectRequest> = mongoose.models.ProjectRequest || mongoose.model<IProjectRequest>("ProjectRequest", ProjectRequestSchema);
