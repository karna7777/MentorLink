import mongoose from "mongoose";
import { DAYS } from "../utils/constants.js";

const availabilitySchema = new mongoose.Schema(
  {
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: String, enum: DAYS, required: true },
    startTime: { type: String, required: true }, // "HH:mm", 24-hour
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

export const Availability = mongoose.model("Availability", availabilitySchema);
