import { ask, askNumber } from "../io.js";
import { sectionHeader, info, success } from "../ui.js";
import { listBookingsForMentee, listBookingsForMentor, leaveFeedback } from "../../services/bookingService.js";
import { listMessages, listResources } from "../../services/sessionService.js";
import { addRating } from "../../services/mentorService.js";
import { BOOKING_STATUS } from "../../utils/constants.js";

export async function sessionHistoryScreen(user, role) {
  sectionHeader("SESSION HISTORY");

  const bookings = role === "mentor" ? await listBookingsForMentor(user._id) : await listBookingsForMentee(user._id);
  const completed = bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);

  if (completed.length === 0) {
    info("No completed sessions yet.");
    return;
  }

  for (const b of completed) {
    const other = role === "mentor" ? b.mentee.name : b.mentor.name;
    const [messages, resources] = await Promise.all([listMessages(b._id), listResources(b._id)]);

    console.log(`Session ${b.bookingId}\n`);
    console.log(`${role === "mentor" ? "Mentee" : "Mentor"} : ${other}`);
    console.log(`Topic  : ${b.topic || "-"}`);
    console.log(`Day    : ${b.day}`);
    console.log(`Status : ${b.status}`);
    console.log(`\nResources: ${resources.length}`);
    console.log(`Messages : ${messages.length}`);
    if (b.feedbackRating) {
      console.log(`Feedback : ${b.feedbackRating}/5 — ${b.feedbackComment || ""}`);
    }
    console.log();
  }

  if (role !== "mentee") return;

  const raw = await ask("Enter a Booking ID to leave feedback, or press Enter to go back: ");
  if (!raw) return;
  const booking = completed.find((b) => b.bookingId === raw.toUpperCase());
  if (!booking) {
    info("Booking not found.");
    return;
  }
  if (booking.feedbackRating) {
    info("You've already left feedback for this session.");
    return;
  }

  const rating = await askNumber("Rating (1-5): ", { min: 1, max: 5 });
  const comment = await ask("Comment: ");
  await leaveFeedback(booking.bookingId, rating, comment);
  await addRating(booking.mentor._id, rating);
  success("Thanks for your feedback!");
}
