import mongoose from "mongoose";
import { RESOURCE_TYPES } from "../utils/constants.js";

const resourceSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: RESOURCE_TYPES, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export const Resource = mongoose.model("Resource", resourceSchema);
