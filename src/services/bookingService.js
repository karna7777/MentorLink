import { customAlphabet } from "nanoid";
import { Booking } from "../models/Booking.js";
import { listAvailabilityForDay } from "./availabilityService.js";
import { BOOKING_STATUS } from "../utils/constants.js";
import { intervalsOverlap, isWithin, minutesToTime, timeToMinutes } from "../utils/time.js";

const nanoid = customAlphabet("0123456789", 4);

const ACTIVE_STATUSES = [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED];
const SLOT_STEP_MINUTES = 30;

export class BookingError extends Error {}

async function generateBookingId() {
  let id;
  let exists = true;
  while (exists) {
    id = `ML${nanoid()}`;
    exists = await Booking.exists({ bookingId: id });
  }
  return id;
}

async function getActiveBookingsForMentorDay(mentorId, day) {
  return Booking.find({ mentor: mentorId, day, status: { $in: ACTIVE_STATUSES } });
}

export async function isWithinAvailability(mentorId, day, startTime, endTime) {
  const slots = await listAvailabilityForDay(mentorId, day);
  return slots.some((slot) => isWithin(startTime, endTime, slot.startTime, slot.endTime));
}

export async function findConflict(mentorId, day, startTime, endTime, excludeBookingId = null) {
  const bookings = await getActiveBookingsForMentorDay(mentorId, day);
  return bookings.find(
    (b) =>
      String(b._id) !== String(excludeBookingId) &&
      intervalsOverlap(startTime, endTime, b.startTime, b.endTime)
  );
}

export async function suggestAlternativeSlots(mentorId, day, durationMinutes, limit = 3) {
  const availSlots = await listAvailabilityForDay(mentorId, day);
  const bookings = await getActiveBookingsForMentorDay(mentorId, day);
  const suggestions = [];

  for (const avail of availSlots) {
    let cursor = timeToMinutes(avail.startTime);
    const windowEnd = timeToMinutes(avail.endTime);

    while (cursor + durationMinutes <= windowEnd && suggestions.length < limit) {
      const candidateStart = minutesToTime(cursor);
      const candidateEnd = minutesToTime(cursor + durationMinutes);
      const conflict = bookings.some((b) =>
        intervalsOverlap(candidateStart, candidateEnd, b.startTime, b.endTime)
      );
      if (!conflict) {
        suggestions.push(candidateStart);
      }
      cursor += SLOT_STEP_MINUTES;
    }
    if (suggestions.length >= limit) break;
  }

  return suggestions;
}

export async function createBooking({ mentorId, menteeId, day, startTime, durationMinutes, topic }) {
  const endTime = minutesToTime(timeToMinutes(startTime) + durationMinutes);

  const withinAvailability = await isWithinAvailability(mentorId, day, startTime, endTime);
  if (!withinAvailability) {
    const error = new BookingError("Mentor is not available at that time.");
    error.code = "OUTSIDE_AVAILABILITY";
    throw error;
  }

  const conflict = await findConflict(mentorId, day, startTime, endTime);
  if (conflict) {
    const error = new BookingError(
      `Mentor already has a booking from ${conflict.startTime} to ${conflict.endTime}.`
    );
    error.code = "CONFLICT";
    error.suggestions = await suggestAlternativeSlots(mentorId, day, durationMinutes);
    throw error;
  }

  const bookingId = await generateBookingId();
  return Booking.create({
    bookingId,
    mentor: mentorId,
    mentee: menteeId,
    day,
    startTime,
    endTime,
    durationMinutes,
    topic,
    status: BOOKING_STATUS.PENDING,
  });
}

export async function listBookingsForMentee(menteeId) {
  return Booking.find({ mentee: menteeId }).populate("mentor").sort({ createdAt: -1 });
}

export async function listBookingsForMentor(mentorId) {
  return Booking.find({ mentor: mentorId }).populate("mentee").sort({ createdAt: -1 });
}

export async function getBookingByBookingId(bookingId) {
  return Booking.findOne({ bookingId }).populate("mentor mentee");
}

export async function updateBookingStatus(bookingId, status) {
  return Booking.findOneAndUpdate({ bookingId }, { $set: { status } }, { new: true });
}

export async function leaveFeedback(bookingId, rating, comment) {
  return Booking.findOneAndUpdate(
    { bookingId },
    { $set: { feedbackRating: rating, feedbackComment: comment } },
    { new: true }
  );
}
