import { ask } from "../io.js";
import { clearScreen, banner, printMenu, error, success } from "../ui.js";
import { findMentorScreen, searchMentorsScreen, browseAllMentorsScreen } from "./findMentor.js";
import { viewMentorProfileScreen } from "./mentorProfileView.js";
import { viewMentorAvailabilityScreen } from "./availabilityScreen.js";
import { bookSessionScreen, myBookingsScreen } from "./bookingScreen.js";
import { selectJoinableBooking, sessionRoomScreen, chatScreen } from "./sessionScreen.js";
import { sessionHistoryScreen } from "./historyScreen.js";

const MENU = [
  "Find a Mentor",
  "Search / Filter Mentors",
  "View Mentor Profile",
  "Check Availability",
  "Book Session",
  "My Bookings",
  "Join Session",
  "Chat",
  "Session History",
  "Logout",
];

export async function menteeDashboard(user) {
  let loggedIn = true;
  while (loggedIn) {
    clearScreen();
    banner();
    console.log("╔══════════════════════════════════════╗");
    console.log("║          MENTEE DASHBOARD             ║");
    console.log("╚══════════════════════════════════════╝\n");
    printMenu(MENU);

    const choice = Number(await ask("Enter your choice: "));

    try {
      switch (choice) {
        case 1: {
          const mentor = await findMentorScreen(user);
          if (mentor) await viewMentorProfileScreen(user, mentor);
          break;
        }
        case 2: {
          const mentor = await searchMentorsScreen();
          if (mentor) await viewMentorProfileScreen(user, mentor);
          break;
        }
        case 3: {
          const mentor = await browseAllMentorsScreen();
          if (mentor) await viewMentorProfileScreen(user, mentor);
          break;
        }
        case 4: {
          const mentor = await browseAllMentorsScreen();
          if (mentor) await viewMentorAvailabilityScreen(mentor);
          break;
        }
        case 5: {
          const mentor = await browseAllMentorsScreen();
          if (mentor) await bookSessionScreen(user, mentor);
          break;
        }
        case 6:
          await myBookingsScreen(user);
          break;
        case 7: {
          const booking = await selectJoinableBooking(user, "mentee");
          if (booking) await sessionRoomScreen(user, booking, "mentee");
          break;
        }
        case 8: {
          const booking = await selectJoinableBooking(user, "mentee");
          if (booking) await chatScreen(booking, user);
          break;
        }
        case 9:
          await sessionHistoryScreen(user, "mentee");
          break;
        case 10:
          success("\nLogged out. See you soon!");
          loggedIn = false;
          break;
        default:
          error("Invalid choice.");
      }
    } catch (err) {
      error(`\nSomething went wrong: ${err.message}`);
    }

    if (loggedIn) await ask("\nPress Enter to continue...");
  }
}
