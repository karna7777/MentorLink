import { ask, askNumber } from "../io.js";
import { sectionHeader, success, info, error, printMenu } from "../ui.js";
import { upsertMentorProfile, getMentorProfile } from "../../services/mentorService.js";
import { SKILL_CATEGORIES, GOALS, INDUSTRIES } from "../../utils/constants.js";

async function pickMultiple(label, options) {
  console.log(`\n${label} (comma-separated numbers, e.g. 1,3,4):`);
  printMenu(options);
  while (true) {
    const raw = await ask("Choose: ");
    const indices = raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n));
    const valid = indices.every((n) => n >= 1 && n <= options.length);
    if (valid && indices.length > 0) {
      return [...new Set(indices.map((n) => options[n - 1]))];
    }
    error(`Please enter valid numbers between 1 and ${options.length}, separated by commas.`);
  }
}

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

export async function editOwnMentorProfile(user) {
  sectionHeader("MY PROFILE");

  const existing = await getMentorProfile(user._id);
  if (existing) {
    printMentorProfileCard(existing, user);
    const answer = await ask("\nEdit this profile? (y/n): ");
    if (answer.toLowerCase() !== "y") return existing;
  } else {
    info("You don't have a mentor profile yet. Let's set one up.");
  }

  const title = await ask("Title (e.g. AI/ML Engineer): ");
  const skills = await pickMultiple("Skills", SKILL_CATEGORIES);
  const industry = await pickOne("Industry", INDUSTRIES);
  const experienceYears = await askNumber("Experience (years): ", { min: 0, max: 60 });
  const goals = await pickMultiple("What can you help mentees with?", GOALS);
  const languagesRaw = await ask("Languages spoken (comma-separated): ");
  const languages = languagesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const bio = await ask("About you (short bio): ");

  const profile = await upsertMentorProfile(user._id, {
    title,
    skills,
    industry,
    experienceYears,
    goals,
    languages,
    bio,
  });

  success("\nProfile saved.");
  return profile;
}

export function printMentorProfileCard(profile, user) {
  console.log(`Name       : ${user.name}`);
  console.log(`Role       : ${profile.title}`);
  console.log(`Experience : ${profile.experienceYears} years`);
  console.log(`Industry   : ${profile.industry}`);
  console.log(`Skills     : ${profile.skills.join(", ")}`);
  console.log(`Languages  : ${profile.languages.join(", ") || "-"}`);
  console.log(`\nAbout:\n${profile.bio || "-"}`);
  console.log(`\nRating     : ${profile.rating !== null ? profile.rating.toFixed(1) : "No ratings yet"}`);
  console.log(`Sessions   : ${profile.sessionsCompleted}`);
}
