import test from "node:test";
import assert from "node:assert/strict";
import {
  gradeQuestion,
  gradeExercise,
  wordCount,
  normalizeSearch,
} from "../src/lib/grading.js";
test("accepts only verified key alternatives and rejects spelling changes", () => {
  const q = {
    id: "q",
    answerStatus: "verified",
    acceptedAnswers: ["three days", "3 days"],
    wordLimit: 2,
  };
  assert.equal(gradeQuestion(q, " THREE   DAYS ").status, "correct");
  assert.equal(gradeQuestion(q, "3 days").status, "correct");
  assert.equal(gradeQuestion(q, "three day").status, "incorrect");
  assert.equal(gradeQuestion(q, "the three days").reason, "word_limit");
});
test("unverified and open items are excluded from score denominator", () => {
  const e = {
    questions: [
      { id: "a", answerStatus: "verified", acceptedAnswers: ["Not Given"] },
      { id: "b", answerStatus: "needs_checking", acceptedAnswers: [] },
    ],
  };
  assert.deepEqual(gradeExercise(e, { a: "Not Given", b: "guess" }), {
    results: [
      { questionId: "a", status: "correct" },
      { questionId: "b", status: "ungraded" },
    ],
    correct: 1,
    gradableCount: 1,
    needsCheckingCount: 1,
  });
});
test("hyphenated words stay one token and accentless Vietnamese is searchable", () => {
  assert.equal(wordCount("a see-through window"), 3);
  assert.equal(normalizeSearch("Sức khỏe ở Đồng Tháp"), "suc khoe o dong thap");
});
