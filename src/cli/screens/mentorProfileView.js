import { ask } from "../io.js";
import { sectionHeader, printMenu, error } from "../ui.js";
import { printMentorProfileCard } from "./mentorProfile.js";
import { viewMentorAvailabilityScreen } from "./availabilityScreen.js";
import { bookSessionScreen } from "./bookingScreen.js";

export async function viewMentorProfileScreen(user, mentorProfile) {
  let active = true;
  while (active) {
    sectionHeader("MENTOR PROFILE");
    printMentorProfileCard(mentorProfile, mentorProfile.user);

    console.log();
    printMenu(["Check Availability", "Book Session", "Back"]);
    const choice = Number(await ask("Choose: "));

    switch (choice) {
      case 1:
        await viewMentorAvailabilityScreen(mentorProfile);
        break;
      case 2:
        await bookSessionScreen(user, mentorProfile);
        break;
      case 3:
        active = false;
        break;
      default:
        error("Invalid choice.");
    }
  }
}
