import mongoose from "mongoose";

const mentorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    title: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    industry: { type: String, required: true },
    experienceYears: { type: Number, required: true, min: 0 },
    goals: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    bio: { type: String, default: "" },
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

mentorProfileSchema.virtual("rating").get(function () {
  return this.ratingCount === 0 ? null : this.ratingSum / this.ratingCount;
});

mentorProfileSchema.set("toObject", { virtuals: true });
mentorProfileSchema.set("toJSON", { virtuals: true });

export const MentorProfile = mongoose.model("MentorProfile", mentorProfileSchema);
