import { exams } from "./exams.js";

const educationRank = { "10th": 1, "12th": 2, graduate: 3 };
const allowedInterests = new Set([
  "administration",
  "finance",
  "defence",
  "law",
  "public-service",
]);
const allowedWorkStyles = new Set(["desk", "field", "mixed", "unsure"]);
const allowedReadiness = new Set(["comfortable", "concerned", "unsure"]);

export function validateProfile(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    return "Please provide your profile details.";
  }

  if (!Number.isInteger(profile.age) || profile.age < 15 || profile.age > 65) {
    return "Age must be a whole number between 15 and 65.";
  }
  if (!Object.hasOwn(educationRank, profile.education)) {
    return "Choose your highest completed education level.";
  }
  if (
    typeof profile.studyHours !== "number" ||
    !Number.isFinite(profile.studyHours) ||
    profile.studyHours < 0.5 ||
    profile.studyHours > 12
  ) {
    return "Daily study time must be between 0.5 and 12 hours.";
  }
  if (
    !Number.isInteger(profile.focusMinutes) ||
    profile.focusMinutes < 15 ||
    profile.focusMinutes > 180
  ) {
    return "Focus-session capacity must be between 15 and 180 minutes.";
  }
  if (!allowedWorkStyles.has(profile.workStyle)) {
    return "Choose a valid work-style preference.";
  }
  if (!allowedReadiness.has(profile.physicalReadiness)) {
    return "Choose a valid physical-readiness response.";
  }
  if (
    !Array.isArray(profile.interests) ||
    profile.interests.length < 1 ||
    profile.interests.some((interest) => !allowedInterests.has(interest))
  ) {
    return "Choose at least one valid career interest.";
  }
  if (typeof profile.state !== "string" || profile.state.length > 60) {
    return "State or union territory must be 60 characters or fewer.";
  }

  return null;
}

function scoreExam(profile, exam) {
  const educationMeetsMinimum =
    educationRank[profile.education] >= educationRank[exam.minEducation];
  const ageInRange = profile.age >= exam.minAge && profile.age <= exam.maxAge;

  let score = 0;
  score += educationMeetsMinimum ? 30 : 8;
  score += ageInRange ? 25 : 4;

  const matchedInterests = profile.interests.filter((interest) =>
    exam.interests.includes(interest),
  ).length;
  score += Math.round((matchedInterests / profile.interests.length) * 20);

  const workStyleMatch =
    profile.workStyle === "unsure" ||
    exam.workStyle === "mixed" ||
    profile.workStyle === exam.workStyle;
  score += workStyleMatch ? 10 : 4;

  const studyFit = Math.min(profile.studyHours / exam.studyHours, 1);
  score += Math.round(studyFit * 7);
  score += profile.focusMinutes >= 45 ? 4 : 2;

  const physicalRequirement = exam.workStyle === "field";
  const physicalConcern =
    physicalRequirement && profile.physicalReadiness === "concerned";
  score += physicalConcern ? 0 : 4;

  const eligible = educationMeetsMinimum && ageInRange;
  return {
    id: exam.id,
    name: exam.name,
    organization: exam.organization,
    category: exam.category,
    score: Math.min(score, 98),
    eligibility: eligible
      ? "Appears to meet basic age and education criteria"
      : "Check eligibility carefully before applying",
    educationMeetsMinimum,
    ageInRange,
    overview: exam.overview,
    subjects: exam.subjects,
    plan: exam.plan,
    resources: exam.resources,
    caution: exam.caution,
    physicalNote: physicalConcern
      ? "You marked physical requirements as a concern. Review the official medical and physical standards before prioritising this exam."
      : physicalRequirement && profile.physicalReadiness === "unsure"
        ? "Review the official physical and medical standards; your response was unsure."
        : null,
  };
}

export function recommendExams(profile) {
  const error = validateProfile(profile);
  if (error) {
    const validationError = new Error(error);
    validationError.status = 400;
    throw validationError;
  }

  return exams
    .map((exam) => scoreExam(profile, exam))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((exam, index) => ({ ...exam, rank: index + 1 }));
}
