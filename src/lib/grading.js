export function normalizeAnswer(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
export function wordCount(value) {
  return String(value ?? "")
    .trim()
    .split(/\s+/u)
    .filter(Boolean).length;
}
export function gradeQuestion(q, value) {
  if (q.answerStatus !== "verified") return { status: "ungraded" };
  const input = normalizeAnswer(value);
  if (!input) return { status: "unanswered" };
  if (q.wordLimit && wordCount(value) > q.wordLimit)
    return { status: "incorrect", reason: "word_limit" };
  return {
    status: q.acceptedAnswers.some((a) => normalizeAnswer(a) === input)
      ? "correct"
      : "incorrect",
  };
}
export function gradeExercise(ex, answers) {
  const results = ex.questions.map((q) => ({
    questionId: q.id,
    ...gradeQuestion(q, answers[q.id]),
  }));
  return {
    results,
    correct: results.filter((r) => r.status === "correct").length,
    gradableCount: results.filter((r) => r.status !== "ungraded").length,
    needsCheckingCount: results.filter((r) => r.status === "ungraded").length,
  };
}
export function normalizeSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
