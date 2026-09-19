import { ask } from "../io.js";
import { sectionHeader, printMenu, success, error, info } from "../ui.js";
import {
  listBookingsForMentee,
  listBookingsForMentor,
  updateBookingStatus,
} from "../../services/bookingService.js";
import { sendMessage, listMessages, addResource, listResources } from "../../services/sessionService.js";
import { recordSessionCompleted } from "../../services/mentorService.js";
import { BOOKING_STATUS, RESOURCE_TYPES } from "../../utils/constants.js";

export async function selectJoinableBooking(user, role) {
  const bookings =
    role === "mentor" ? await listBookingsForMentor(user._id) : await listBookingsForMentee(user._id);
  const joinable = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED);

  if (joinable.length === 0) {
    info("You have no confirmed sessions to join right now.");
    return null;
  }

  console.log("Confirmed sessions:\n");
  joinable.forEach((b, i) => {
    const other = role === "mentor" ? b.mentee.name : b.mentor.name;
    console.log(`${i + 1}. ${b.bookingId} — ${other} — ${b.day} ${b.startTime} — ${b.topic || "-"}`);
  });

  const raw = await ask("\nSelect a session (0 to go back): ");
  const n = Number(raw);
  if (n === 0 || !Number.isInteger(n) || n < 1 || n > joinable.length) return null;
  return joinable[n - 1];
}

export async function sessionRoomScreen(user, booking, role) {
  const otherPartyName = role === "mentor" ? booking.mentee.name : booking.mentor.name;
  const mentorName = role === "mentor" ? user.name : booking.mentor.name;
  const mentorId = role === "mentor" ? user._id : booking.mentor._id;

  let active = true;
  while (active) {
    sectionHeader("MENTORING SESSION");
    console.log(`Mentor : ${mentorName}`);
    console.log(`${role === "mentor" ? "Mentee" : "With"} : ${otherPartyName}`);
    console.log(`Topic  : ${booking.topic || "-"}`);
    console.log(`\nStatus : ● SESSION ACTIVE`);
    console.log(`\nMeeting Link:\nhttps://meeting-platform/${booking.bookingId}\n`);

    printMenu(["Open Meeting", "Chat", "Share Resource", "View Resources", "End Session", "Back"]);
    const choice = Number(await ask("Choose: "));

    switch (choice) {
      case 1:
        info(`\nOpening https://meeting-platform/${booking.bookingId} in your browser...`);
        info("(This is a placeholder link — plug in a real meeting provider if needed.)");
        break;
      case 2:
        await chatScreen(booking, user);
        break;
      case 3:
        await shareResourceScreen(booking, user);
        break;
      case 4:
        await viewResourcesScreen(booking);
        break;
      case 5:
        await updateBookingStatus(booking.bookingId, BOOKING_STATUS.COMPLETED);
        await recordSessionCompleted(mentorId);
        success("\nSession marked as completed.");
        active = false;
        break;
      case 6:
        active = false;
        break;
      default:
        error("Invalid choice.");
    }
  }
}

export async function chatScreen(booking, user) {
  sectionHeader("SESSION CHAT");

  const messages = await listMessages(booking._id);
  messages.forEach((m) => {
    const label = String(m.sender._id) === String(user._id) ? "You" : m.sender.name;
    console.log(`${label}:\n${m.text}\n`);
  });

  info("Type a message and press Enter. Type /back to return to the session menu.\n");

  while (true) {
    const text = await ask("You: ");
    if (text === "/back" || text === "") break;
    await sendMessage(booking._id, user._id, text);
  }
}

async function shareResourceScreen(booking, user) {
  sectionHeader("SHARE RESOURCE");
  printMenu(RESOURCE_TYPES);
  const choice = Number(await ask("Choose: "));
  if (!Number.isInteger(choice) || choice < 1 || choice > RESOURCE_TYPES.length) {
    error("Invalid choice.");
    return;
  }
  const type = RESOURCE_TYPES[choice - 1];
  const title = await ask("Title: ");
  const url = await ask("URL: ");
  await addResource(booking._id, user._id, type, title, url);
  success("Resource shared.");
}

async function viewResourcesScreen(booking) {
  sectionHeader("SESSION RESOURCES");
  const resources = await listResources(booking._id);
  if (resources.length === 0) {
    info("No resources shared yet.");
    return;
  }
  resources.forEach((r, i) => console.log(`${i + 1}. ${r.title}\n   ${r.url}`));
}
