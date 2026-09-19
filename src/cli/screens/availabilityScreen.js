import { ask } from "../io.js";
import { sectionHeader, printMenu, success, error, info } from "../ui.js";
import { addAvailability, listAvailability, AvailabilityError } from "../../services/availabilityService.js";
import { formatTime12h } from "../../utils/time.js";
import { DAYS } from "../../utils/constants.js";
import { isValidTime } from "../../utils/validators.js";

export async function setAvailabilityScreen(user) {
  sectionHeader("SET AVAILABILITY");

  console.log("Day:");
  printMenu(DAYS);
  const dayRaw = await ask("Choose: ");
  const dayIndex = Number(dayRaw);
  if (!Number.isInteger(dayIndex) || dayIndex < 1 || dayIndex > DAYS.length) {
    error("Invalid day selection.");
    return;
  }
  const day = DAYS[dayIndex - 1];

  let startTime;
  while (true) {
    startTime = await ask("Start time (HH:mm, 24-hour): ");
    if (isValidTime(startTime)) break;
    error("Please enter a valid time, e.g. 14:00.");
  }

  let endTime;
  while (true) {
    endTime = await ask("End time (HH:mm, 24-hour): ");
    if (isValidTime(endTime)) break;
    error("Please enter a valid time, e.g. 17:00.");
  }

  try {
    await addAvailability(user._id, day, startTime, endTime);
    success("\nAvailability added.");
  } catch (err) {
    if (err instanceof AvailabilityError) {
      error(`\n${err.message}`);
      return;
    }
    throw err;
  }
}

export async function viewOwnAvailabilityScreen(user) {
  sectionHeader("MY AVAILABILITY");
  await printAvailability(user._id);
}

export async function viewMentorAvailabilityScreen(mentorProfile) {
  sectionHeader(`${mentorProfile.user.name.toUpperCase()}'S AVAILABILITY`);
  await printAvailability(mentorProfile.user._id);
}

async function printAvailability(mentorId) {
  const slots = await listAvailability(mentorId);
  if (slots.length === 0) {
    info("No availability set yet.");
    return;
  }

  const byDay = {};
  for (const slot of slots) {
    byDay[slot.day] ??= [];
    byDay[slot.day].push(slot);
  }

  for (const day of DAYS) {
    if (!byDay[day]) continue;
    console.log(day);
    for (const slot of byDay[day]) {
      console.log(`  ${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`);
    }
    console.log();
  }
}
