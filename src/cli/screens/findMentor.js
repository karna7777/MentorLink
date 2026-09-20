import { ask } from "../io.js";
import { sectionHeader, printMenu, error, info } from "../ui.js";
import { listAllMentorProfiles, findMentorsBySkill } from "../../services/mentorService.js";
import { ensureMenteeProfile } from "./menteeProfile.js";
import { rankMentors } from "../../services/matchingService.js";
import { selectFromMentorList } from "./browseMentors.js";
import { SKILL_CATEGORIES } from "../../utils/constants.js";

// Menu option 1: recommend mentors ranked by the smart-matching algorithm.
export async function findMentorScreen(user) {
  sectionHeader("FIND A MENTOR");

  const menteeProfile = await ensureMenteeProfile(user);
  const allMentors = await listAllMentorProfiles();

  if (allMentors.length === 0) {
    info("No mentors have registered yet.");
    return null;
  }

  const ranked = rankMentors(menteeProfile, allMentors);
  console.log("Recommended for you, based on your profile:\n");

  const withScores = ranked.map((r) => Object.assign(r.mentorProfile, { matchPercent: r.total }));
  return selectFromMentorList(withScores);
}

// Menu option 2: manual search by skill category.
export async function searchMentorsScreen() {
  sectionHeader("SEARCH / FILTER MENTORS");

  console.log("What are you looking for?\n");
  printMenu(SKILL_CATEGORIES);
  const raw = await ask("Choose: ");
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > SKILL_CATEGORIES.length) {
    error("Invalid selection.");
    return null;
  }
  const skill = SKILL_CATEGORIES[n - 1];

  const mentors = await findMentorsBySkill(skill);
  console.log(`\n========== ${skill.toUpperCase()} MENTORS ==========\n`);
  return selectFromMentorList(mentors);
}

// Menu option 3: browse every mentor profile directly.
export async function browseAllMentorsScreen() {
  sectionHeader("ALL MENTORS");
  const mentors = await listAllMentorProfiles();
  return selectFromMentorList(mentors);
}
