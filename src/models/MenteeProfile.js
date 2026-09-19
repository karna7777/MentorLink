import mongoose from "mongoose";

const menteeProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    interestedSkill: { type: String, default: "" },
    experienceLevel: { type: String, default: "" },
    industry: { type: String, default: "" },
    goal: { type: String, default: "" },
  },
  { timestamps: true }
);

export const MenteeProfile = mongoose.model("MenteeProfile", menteeProfileSchema);
