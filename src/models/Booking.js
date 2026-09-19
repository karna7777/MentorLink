import mongoose from "mongoose";
import { BOOKING_STATUS, DAYS } from "../utils/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: String, enum: DAYS, required: true },
    startTime: { type: String, required: true }, // "HH:mm"
    endTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    topic: { type: String, default: "" },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    feedbackRating: { type: Number, min: 1, max: 5 },
    feedbackComment: { type: String },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
