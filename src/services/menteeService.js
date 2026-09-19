import { MenteeProfile } from "../models/MenteeProfile.js";

export async function upsertMenteeProfile(userId, data) {
  return MenteeProfile.findOneAndUpdate(
    { user: userId },
    { $set: { ...data, user: userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function getMenteeProfile(userId) {
  return MenteeProfile.findOne({ user: userId });
}
