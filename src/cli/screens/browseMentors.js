import { ask } from "../io.js";
import { error, info } from "../ui.js";

export function printMentorListItem(index, mentorProfile, matchPercent) {
  const user = mentorProfile.user;
  const scoreLabel = matchPercent !== undefined ? `   Match: ${matchPercent}%` : "";
  console.log(`${index}. ${user.name}`);
  console.log(`   ${mentorProfile.title}`);
  console.log(`   Experience: ${mentorProfile.experienceYears} years${scoreLabel}`);
  console.log();
}

export async function selectFromMentorList(mentorProfiles) {
  if (mentorProfiles.length === 0) {
    info("No mentors found.");
    return null;
  }

  mentorProfiles.forEach((profile, i) => printMentorListItem(i + 1, profile, profile.matchPercent));

  const raw = await ask(`Select mentor (0 to go back): `);
  const n = Number(raw);
  if (n === 0) return null;
  if (!Number.isInteger(n) || n < 1 || n > mentorProfiles.length) {
    error("Invalid selection.");
    return null;
  }
  return mentorProfiles[n - 1];
}
