import { ask } from "../io.js";
import { info, error, printMenu, success } from "../ui.js";
import { upsertMenteeProfile, getMenteeProfile } from "../../services/menteeService.js";
import { SKILL_CATEGORIES, EXPERIENCE_LEVELS, INDUSTRIES, GOALS } from "../../utils/constants.js";

async function pickOne(label, options) {
  console.log(`\n${label}:`);
  printMenu(options);
  while (true) {
    const raw = await ask("Choose: ");
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) {
      return options[n - 1];
    }
    error(`Please enter a number between 1 and ${options.length}.`);
  }
}

export async function ensureMenteeProfile(user) {
  const existing = await getMenteeProfile(user._id);
  if (existing) return existing;

  info("\nLet's quickly set up your mentee profile so we can find the right mentors for you.");
  const interestedSkill = await pickOne("What are you looking for?", SKILL_CATEGORIES);
  const experienceLevel = await pickOne("Your experience level", EXPERIENCE_LEVELS);
  const industry = await pickOne("Industry you're interested in", INDUSTRIES);
  const goal = await pickOne("Your goal", GOALS);

  const profile = await upsertMenteeProfile(user._id, {
    interestedSkill,
    experienceLevel,
    industry,
    goal,
  });
  success("Profile saved.\n");
  return profile;
}
