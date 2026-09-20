import { ask } from "../io.js";
import { clearScreen, banner, printMenu, error, success } from "../ui.js";
import { editOwnMentorProfile } from "./mentorProfile.js";
import { setAvailabilityScreen, viewOwnAvailabilityScreen } from "./availabilityScreen.js";
import { viewBookingsScreen, manageRequestsScreen, todaysSessionsScreen } from "./bookingScreen.js";
import { selectJoinableBooking, sessionRoomScreen, chatScreen } from "./sessionScreen.js";
import { sessionHistoryScreen } from "./historyScreen.js";

const MENU = [
  "My Profile",
  "Set Availability",
  "View My Availability",
  "View Bookings",
  "Manage Requests",
  "Today's Sessions",
  "Join Session",
  "Chat",
  "Session History",
  "Logout",
];

export async function mentorDashboard(user) {
  let loggedIn = true;
  while (loggedIn) {
    clearScreen();
    banner();
    console.log("╔══════════════════════════════════════╗");
    console.log("║           MENTOR DASHBOARD            ║");
    console.log("╚══════════════════════════════════════╝\n");
    printMenu(MENU);

    const choice = Number(await ask("Enter your choice: "));

    try {
      switch (choice) {
        case 1:
          await editOwnMentorProfile(user);
          break;
        case 2:
          await setAvailabilityScreen(user);
          break;
        case 3:
          await viewOwnAvailabilityScreen(user);
          break;
        case 4:
          await viewBookingsScreen(user);
          break;
        case 5:
          await manageRequestsScreen(user);
          break;
        case 6:
          await todaysSessionsScreen(user);
          break;
        case 7: {
          const booking = await selectJoinableBooking(user, "mentor");
          if (booking) await sessionRoomScreen(user, booking, "mentor");
          break;
        }
        case 8: {
          const booking = await selectJoinableBooking(user, "mentor");
          if (booking) await chatScreen(booking, user);
          break;
        }
        case 9:
          await sessionHistoryScreen(user, "mentor");
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
