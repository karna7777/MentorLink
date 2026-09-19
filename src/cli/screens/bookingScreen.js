import dayjs from "dayjs";
import { ask, askNumber } from "../io.js";
import { sectionHeader, success, error, info, printMenu } from "../ui.js";
import {
  createBooking,
  listBookingsForMentee,
  listBookingsForMentor,
  updateBookingStatus,
  BookingError,
} from "../../services/bookingService.js";
import { formatTime12h } from "../../utils/time.js";
import { isValidTime } from "../../utils/validators.js";
import { DAYS, BOOKING_STATUS } from "../../utils/constants.js";

export async function bookSessionScreen(user, mentorProfile) {
  sectionHeader("BOOK SESSION");

  console.log("Day:");
  printMenu(DAYS);
  const dayIndex = Number(await ask("Choose: "));
  if (!Number.isInteger(dayIndex) || dayIndex < 1 || dayIndex > DAYS.length) {
    error("Invalid day selection.");
    return;
  }
  const day = DAYS[dayIndex - 1];

  let startTime;
  while (true) {
    startTime = await ask("Time (HH:mm, 24-hour): ");
    if (isValidTime(startTime)) break;
    error("Please enter a valid time, e.g. 14:30.");
  }

  const durationMinutes = await askNumber("Duration (minutes, e.g. 30): ", { min: 15, max: 120 });
  const topic = await ask("Topic: ");

  try {
    const booking = await createBooking({
      mentorId: mentorProfile.user._id,
      menteeId: user._id,
      day,
      startTime,
      durationMinutes,
      topic,
    });

    console.log();
    console.log("╔══════════════════════════════════════╗");
    console.log("║       BOOKING CONFIRMED ✓            ║");
    console.log("╚══════════════════════════════════════╝\n");
    console.log(`Mentor : ${mentorProfile.user.name}`);
    console.log(`Day    : ${booking.day}`);
    console.log(`Time   : ${formatTime12h(booking.startTime)}`);
    console.log(`Duration: ${booking.durationMinutes} minutes`);
    console.log(`\nBooking ID: ${booking.bookingId}`);
    console.log(`Status : ${booking.status} (awaiting mentor confirmation)`);
  } catch (err) {
    if (err instanceof BookingError) {
      error(`\n❌ Slot unavailable.\n`);
      console.log(`Reason:\n${err.message}\n`);
      if (err.suggestions?.length) {
        console.log("Available slots:\n");
        err.suggestions.forEach((slot) => console.log(formatTime12h(slot)));
      }
      return;
    }
    throw err;
  }
}

export async function myBookingsScreen(user) {
  sectionHeader("MY BOOKINGS");
  const bookings = await listBookingsForMentee(user._id);
  if (bookings.length === 0) {
    info("You have no bookings yet.");
    return;
  }

  bookings.forEach((b) => printBookingCard(b, b.mentor.name, "Mentor"));

  const raw = await ask("Enter a Booking ID to cancel it, or press Enter to go back: ");
  if (!raw) return;
  const booking = bookings.find((b) => b.bookingId === raw.toUpperCase());
  if (!booking) {
    error("Booking not found.");
    return;
  }
  if (![BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status)) {
    error("This booking can no longer be cancelled.");
    return;
  }
  await updateBookingStatus(booking.bookingId, BOOKING_STATUS.CANCELLED);
  success("Booking cancelled.");
}

export async function viewBookingsScreen(user) {
  sectionHeader("MY BOOKINGS");
  const bookings = await listBookingsForMentor(user._id);
  if (bookings.length === 0) {
    info("You have no bookings yet.");
    return;
  }
  bookings.forEach((b) => printBookingCard(b, b.mentee.name, "Mentee"));
}

export async function manageRequestsScreen(user) {
  sectionHeader("MANAGE REQUESTS");
  const bookings = await listBookingsForMentor(user._id);
  const pending = bookings.filter((b) => b.status === BOOKING_STATUS.PENDING);

  if (pending.length === 0) {
    info("No pending requests.");
    return;
  }

  pending.forEach((b) => printBookingCard(b, b.mentee.name, "Mentee"));

  const raw = await ask("Enter a Booking ID to manage it, or press Enter to go back: ");
  if (!raw) return;
  const booking = pending.find((b) => b.bookingId === raw.toUpperCase());
  if (!booking) {
    error("Booking not found.");
    return;
  }
  await manageBookingScreen(booking);
}

async function manageBookingScreen(booking) {
  console.log(`\nBooking ${booking.bookingId} — currently ${booking.status}`);
  printMenu(["Accept", "Reject", "Cancel", "Back"]);
  const choice = Number(await ask("Choose: "));

  const nextStatus = {
    1: BOOKING_STATUS.CONFIRMED,
    2: BOOKING_STATUS.REJECTED,
    3: BOOKING_STATUS.CANCELLED,
  }[choice];

  if (!nextStatus) return;
  await updateBookingStatus(booking.bookingId, nextStatus);
  success(`Booking ${booking.bookingId} marked as ${nextStatus}.`);
}

export async function todaysSessionsScreen(user) {
  sectionHeader("TODAY'S SESSIONS");
  const today = dayjs().format("dddd");
  const bookings = await listBookingsForMentor(user._id);
  const todays = bookings.filter((b) => b.day === today && b.status === BOOKING_STATUS.CONFIRMED);

  if (todays.length === 0) {
    info(`No confirmed sessions for ${today}.`);
    return;
  }
  todays.forEach((b) => printBookingCard(b, b.mentee.name, "Mentee"));
}

function printBookingCard(booking, otherPartyName, otherPartyLabel) {
  console.log(`#${booking.bookingId}`);
  console.log(`${otherPartyLabel} : ${otherPartyName}`);
  console.log(`Day    : ${booking.day}`);
  console.log(`Time   : ${formatTime12h(booking.startTime)}`);
  console.log(`Topic  : ${booking.topic || "-"}`);
  console.log(`Status : ${booking.status}`);
  console.log();
}
