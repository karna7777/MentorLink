import { Message } from "../models/Message.js";
import { Resource } from "../models/Resource.js";

export async function sendMessage(bookingId, senderId, text) {
  return Message.create({ booking: bookingId, sender: senderId, text });
}

export async function listMessages(bookingId) {
  return Message.find({ booking: bookingId }).populate("sender").sort({ createdAt: 1 });
}

export async function addResource(bookingId, sharedById, type, title, url) {
  return Resource.create({ booking: bookingId, sharedBy: sharedById, type, title, url });
}

export async function listResources(bookingId) {
  return Resource.find({ booking: bookingId }).sort({ createdAt: 1 });
}
