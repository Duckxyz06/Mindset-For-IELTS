import test from "node:test";
import assert from "node:assert/strict";
import { validateExport, APP_ID } from "../src/lib/storage.js";
const valid = {
  schemaVersion: 1,
  appId: APP_ID,
  attempts: [],
  drafts: {},
  bookmarks: [],
  notes: {},
};
test("accepts exports and rejects incompatible versions, unsafe maps and invalid dates", () => {
  assert.equal(validateExport(valid), valid);
  assert.throws(() => validateExport({ ...valid, schemaVersion: 2 }));
  assert.throws(() =>
    validateExport({ ...valid, notes: JSON.parse('{"__proto__":"bad"}') }),
  );
  assert.throws(() =>
    validateExport({ ...valid, attempts: [{ id: "a", submittedAt: "bad" }] }),
  );
});
