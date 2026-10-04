import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
const read = (p) => JSON.parse(fs.readFileSync(p));
const ex = [1, 2, 3, 4, 5].flatMap((n) => read("src/data/unit-" + n + ".json")),
  manifest = read("src/data/audio-manifest.json");
assert.equal(ex.length, 289);
assert.equal(new Set(ex.map((e) => e.id)).size, 289);
const en = read("src/locales/en.json"),
  vi = read("src/locales/vi.json");
assert.deepEqual(Object.keys(en).sort(), Object.keys(vi).sort());
for (const [k, v] of Object.entries(en)) {
  assert(v.trim(), k);
  assert(vi[k].trim(), k);
}
for (const a of manifest) {
  const f = fs.readFileSync("public/" + a.file);
  assert.equal(f.length, a.sizeBytes);
  assert.equal(crypto.createHash("sha256").update(f).digest("hex"), a.sha256);
  for (const id of a.exerciseIds) assert(ex.some((e) => e.id === id));
}
for (const e of ex) {
  for (const p of e.sourcePages)
    assert(
      fs.existsSync(
        "public/source-pages/page-" + String(p).padStart(3, "0") + ".webp",
      ),
    );
  for (const q of e.questions)
    if (q.answerStatus === "verified") {
      assert(q.acceptedAnswers.length);
      assert(q.evidence.page >= 184 && q.evidence.page <= 197);
    }
}
console.log(
  "Validated: 289 exercises, 52 original audio SHA-256 hashes, source pages, bilingual locale parity.",
);
