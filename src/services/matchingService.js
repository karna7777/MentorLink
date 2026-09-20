const WEIGHTS = {
  skill: 40,
  industry: 25,
  goal: 20,
  experience: 15,
};

// Minimum mentor experience (years) expected for a mentee at each level.
const EXPERIENCE_THRESHOLD = {
  Beginner: 2,
  Intermediate: 4,
  Advanced: 6,
};

export function computeMatchScore(menteeProfile, mentorProfile) {
  const skillScore = mentorProfile.skills.includes(menteeProfile.interestedSkill) ? WEIGHTS.skill : 0;

  const industryScore = mentorProfile.industry === menteeProfile.industry ? WEIGHTS.industry : 0;

  const goalScore = mentorProfile.goals.includes(menteeProfile.goal) ? WEIGHTS.goal : 0;

  const threshold = EXPERIENCE_THRESHOLD[menteeProfile.experienceLevel] ?? EXPERIENCE_THRESHOLD.Beginner;
  const experienceRatio = Math.min(mentorProfile.experienceYears / threshold, 1);
  const experienceScore = Math.round(experienceRatio * WEIGHTS.experience);

  const total = skillScore + industryScore + goalScore + experienceScore;

  return {
    total,
    breakdown: { skillScore, industryScore, goalScore, experienceScore },
  };
}

export function rankMentors(menteeProfile, mentorProfiles) {
  return mentorProfiles
    .map((mentorProfile) => ({
      mentorProfile,
      ...computeMatchScore(menteeProfile, mentorProfile),
    }))
    .sort((a, b) => b.total - a.total);
}
