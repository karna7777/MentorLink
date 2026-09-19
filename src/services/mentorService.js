import { MentorProfile } from "../models/MentorProfile.js";

export async function upsertMentorProfile(userId, data) {
  return MentorProfile.findOneAndUpdate(
    { user: userId },
    { $set: { ...data, user: userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function getMentorProfile(userId) {
  return MentorProfile.findOne({ user: userId }).populate("user");
}

export async function findMentorsBySkill(skill) {
  return MentorProfile.find({ skills: skill }).populate("user");
}

export async function listAllMentorProfiles() {
  return MentorProfile.find().populate("user");
}

export async function recordSessionCompleted(userId) {
  return MentorProfile.findOneAndUpdate(
    { user: userId },
    { $inc: { sessionsCompleted: 1 } },
    { new: true }
  );
}

export async function addRating(userId, rating) {
  return MentorProfile.findOneAndUpdate(
    { user: userId },
    { $inc: { ratingSum: rating, ratingCount: 1 } },
    { new: true }
  );
}
