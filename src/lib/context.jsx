import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import i18next from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import en from "../locales/en.json";
import vi from "../locales/vi.json";
import { load, save, APP_ID } from "./storage";
i18next
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, vi: { translation: vi } },
    lng:
      load("settings", {}).uiLanguage === "en"
        ? "en"
        : navigator.language.startsWith("vi")
          ? "vi"
          : "en",
    fallbackLng: "en",
    keySeparator: false,
    interpolation: { escapeValue: false },
  });
const Context = createContext();
export function Provider({ children }) {
  const [settings, setSettings] = useState(() =>
    load("settings", {
      uiLanguage: navigator.language.startsWith("vi") ? "vi" : "en",
      solutionLanguage: "follow",
      theme: "dark",
      fontSize: 18,
    }),
  );
  const [progress, setProgress] = useState(() =>
    load("progress", {
      attempts: [],
      drafts: {},
      bookmarks: [],
      notes: {},
      resume: null,
    }),
  );
  const [storageError, setStorageError] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    i18next.changeLanguage(settings.uiLanguage === "en" ? "en" : "vi");
    document.documentElement.lang = settings.uiLanguage === "en" ? "en" : "vi";
    document.body.classList.toggle("light", settings.theme === "light");
    document.documentElement.style.setProperty(
      "--read",
      settings.fontSize + "px",
    );
    if (!save("settings", settings)) setStorageError(true);
  }, [settings]);
  useEffect(() => {
    if (!save("progress", progress)) setStorageError(true);
  }, [progress]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(id);
    }
  }, [toast]);
  const draft = useCallback(
    (id, value) =>
      setProgress((p) => ({ ...p, drafts: { ...p.drafts, [id]: value } })),
    [],
  );
  const submit = useCallback(
    (a) =>
      setProgress((p) => ({
        ...p,
        attempts: [
          ...p.attempts,
          {
            id: crypto.randomUUID(),
            submittedAt: new Date().toISOString(),
            contentRevision: "v1",
            ...a,
          },
        ],
      })),
    [],
  );
  const bookmark = (id) =>
    setProgress((p) => ({
      ...p,
      bookmarks: p.bookmarks.includes(id)
        ? p.bookmarks.filter((x) => x !== id)
        : [...p.bookmarks, id],
    }));
  const note = (id, v) =>
    setProgress((p) => ({ ...p, notes: { ...p.notes, [id]: v } }));
  const resume = (id) =>
    setProgress((p) => ({
      ...p,
      resume: { exerciseId: id, lastVisitedAt: new Date().toISOString() },
    }));
  const exportData = () => ({
    schemaVersion: 1,
    appId: APP_ID,
    exportedAt: new Date().toISOString(),
    settings,
    ...progress,
    recordingReferences: [],
  });
  return (
    <Context.Provider
      value={{
        settings,
        setSettings,
        progress,
        setProgress,
        draft,
        submit,
        bookmark,
        note,
        resume,
        exportData,
        storageError,
        toast,
        setToast,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
export function useT() {
  const { settings } = useApp();
  const { i18n } = useTranslation();
  return (k, v = {}, mode = settings.uiLanguage) => {
    const tr = (l) => i18n.getFixedT(l)(k, v);
    return mode === "both"
      ? tr("vi") === tr("en")
        ? tr("en")
        : tr("vi") + " / " + tr("en")
      : tr(mode);
  };
}
export function Bi({ en: eng, vi: viet }) {
  const { settings } = useApp();
  const m =
    settings.solutionLanguage === "follow"
      ? settings.uiLanguage
      : settings.solutionLanguage;
  if (m === "both")
    return (
      <div className="bilingual">
        <div lang="en">{eng || "⚠ Needs checking"}</div>
        <div lang="vi">{viet || "⚠ Cần kiểm tra"}</div>
      </div>
    );
  return (
    <div lang={m}>
      {m === "en" ? eng || "⚠ Needs checking" : viet || "⚠ Cần kiểm tra"}
    </div>
  );
}
export function useDeadline(key, seconds) {
  const [deadline, setDeadline] = useState(() => load("timer:" + key, null));
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const n = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(n);
  }, []);
  const start = () => {
    const d = Date.now() + seconds * 1000;
    setDeadline(d);
    save("timer:" + key, d);
  };
  const reset = () => {
    setDeadline(null);
    save("timer:" + key, null);
  };
  const left = deadline
    ? Math.max(0, Math.ceil((deadline - now) / 1000))
    : seconds;
  return {
    left,
    start,
    reset,
    running: !!deadline && left > 0,
    expired: !!deadline && left === 0,
    deadline,
  };
}
export const clock = (s) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
