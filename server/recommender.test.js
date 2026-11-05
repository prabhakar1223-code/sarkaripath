import assert from "node:assert/strict";
import test from "node:test";
import { recommendExams, validateProfile } from "./recommender.js";

const graduateProfile = {
  age: 24,
  education: "graduate",
  studyHours: 4,
  focusMinutes: 45,
  interests: ["administration", "public-service"],
  workStyle: "desk",
  physicalReadiness: "comfortable",
  state: "Karnataka",
};

test("recommends exams in descending fit-score order", () => {
  const recommendations = recommendExams(graduateProfile);

  assert.equal(recommendations.length, 4);
  assert.ok(recommendations[0].score >= recommendations[1].score);
  assert.ok(recommendations.every((exam) => exam.score <= 98));
  assert.ok(recommendations.every((exam) => exam.plan.length > 0));
  assert.ok(recommendations.every((exam) => exam.resources.length > 0));
});

test("marks education and age mismatches for careful eligibility review", () => {
  const recommendations = recommendExams({
    ...graduateProfile,
    age: 40,
    education: "10th",
  });
  const civilServices = recommendations.find((exam) => exam.id === "upsc-cse");

  assert.equal(civilServices.eligibility, "Check eligibility carefully before applying");
  assert.equal(civilServices.educationMeetsMinimum, false);
  assert.equal(civilServices.ageInRange, false);
});

test("uses study time and focus-session length when scoring fit", () => {
  const shortStudyProfile = {
    ...graduateProfile,
    studyHours: 1,
    focusMinutes: 25,
  };
  const sustainableStudyProfile = {
    ...graduateProfile,
    studyHours: 5,
    focusMinutes: 90,
  };
  const shortStudyScore = recommendExams(shortStudyProfile).find(
    (exam) => exam.id === "ssc-cgl",
  ).score;
  const sustainableStudyScore = recommendExams(sustainableStudyProfile).find(
    (exam) => exam.id === "ssc-cgl",
  ).score;

  assert.ok(sustainableStudyScore > shortStudyScore);
});

test("does not recommend a field exam without flagging a stated physical concern", () => {
  const recommendations = recommendExams({
    ...graduateProfile,
    education: "12th",
    age: 18,
    workStyle: "field",
    interests: ["defence"],
    physicalReadiness: "concerned",
  });
  const nda = recommendations.find((exam) => exam.id === "nda");

  assert.match(nda.physicalNote, /medical and physical standards/);
});

test("rejects malformed or out-of-range profiles", () => {
  assert.match(validateProfile({ ...graduateProfile, age: 14 }), /Age must/);
  assert.match(validateProfile({ ...graduateProfile, interests: [] }), /at least one/);
  assert.throws(
    () => recommendExams({ ...graduateProfile, studyHours: 0 }),
    /Daily study time/,
  );
});
