export const APP_ID = "ielts-mindset-3-study-hub";
export function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem("mindset3:v1:" + key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function save(key, data) {
  try {
    localStorage.setItem("mindset3:v1:" + key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
export function validateExport(data) {
  const fail = () => {
    throw Error("progress.invalid");
  };
  const plain = (v) => v && typeof v === "object" && !Array.isArray(v);
  if (
    !plain(data) ||
    data.appId !== APP_ID ||
    data.schemaVersion !== 1 ||
    !Array.isArray(data.attempts) ||
    !plain(data.drafts) ||
    !plain(data.notes) ||
    !Array.isArray(data.bookmarks) ||
    data.attempts.length > 100000
  )
    fail();
  for (const k of ["drafts", "notes"])
    if (
      Object.keys(data[k]).some((k) =>
        ["__proto__", "constructor", "prototype"].includes(k),
      )
    )
      fail();
  if (data.bookmarks.some((v) => typeof v !== "string")) fail();
  if (Object.values(data.notes).some((v) => typeof v !== "string")) fail();
  for (const a of data.attempts) {
    if (
      !plain(a) ||
      typeof a.id !== "string" ||
      !Number.isFinite(Date.parse(a.submittedAt))
    )
      fail();
    for (const k of ["correct", "gradableCount"])
      if (a[k] !== undefined && (!Number.isFinite(a[k]) || a[k] < 0)) fail();
  }
  for (const d of Object.values(data.drafts)) if (!plain(d)) fail();
  return data;
}
export function downloadJSON(data) {
  const u = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = u;
  a.download =
    "mindset3-progress-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
export function recordingDB() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("mindset3-recordings", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("recordings");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function storeRecording(id, blob) {
  const db = await recordingDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("recordings", "readwrite");
    tx.objectStore("recordings").put(blob, id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
export async function readRecording(id) {
  const db = await recordingDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("recordings");
    const r = tx.objectStore("recordings").get(id);
    r.onsuccess = () => {
      db.close();
      resolve(r.result);
    };
    r.onerror = () => {
      db.close();
      reject(r.error);
    };
  });
}
