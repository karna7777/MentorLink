import { Availability } from "../models/Availability.js";
import { intervalsOverlap } from "../utils/time.js";

export class AvailabilityError extends Error {}

export async function addAvailability(mentorId, day, startTime, endTime) {
  if (startTime >= endTime) {
    throw new AvailabilityError("Start time must be before end time.");
  }

  const existing = await Availability.find({ mentor: mentorId, day });
  const overlapping = existing.some((slot) =>
    intervalsOverlap(startTime, endTime, slot.startTime, slot.endTime)
  );
  if (overlapping) {
    throw new AvailabilityError(`This overlaps with an existing ${day} slot you've already set.`);
  }

  return Availability.create({ mentor: mentorId, day, startTime, endTime });
}

export async function listAvailability(mentorId) {
  const slots = await Availability.find({ mentor: mentorId }).sort({ day: 1, startTime: 1 });
  return slots;
}

export async function listAvailabilityForDay(mentorId, day) {
  return Availability.find({ mentor: mentorId, day }).sort({ startTime: 1 });
}

export async function removeAvailability(availabilityId, mentorId) {
  return Availability.findOneAndDelete({ _id: availabilityId, mentor: mentorId });
}
