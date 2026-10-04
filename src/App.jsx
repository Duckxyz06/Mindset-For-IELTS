import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Routes,
  Route,
  NavLink,
  Link,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import Fuse from "fuse.js";
import { useApp, useT, Bi, useDeadline, clock } from "./lib/context";
import {
  exercises,
  units,
  lessons,
  audio,
  pages,
  requirements,
  references,
  asset,
} from "./lib/data";
import { gradeExercise, wordCount, normalizeSearch } from "./lib/grading";
import {
  downloadJSON,
  validateExport,
  storeRecording,
  readRecording,
} from "./lib/storage";
import SourceReader from "./components/SourceReader";
import { AudioProvider, useAudio } from "./components/AudioPlayer";
import vocabulary from "./data/vocabulary.json";
import supplement from "./data/writing-supplement.json";
const navigation = [
  "home",
  "catalog",
  "audio",
  "examSkills",
  "writing",
  "speaking",
  "vocabulary",
  "mock",
  "progress",
  "settings",
];
const href = (n) => (n === "home" ? "/" : "/" + n);
const path = (e) => "/exercise/" + e.id;
function App() {
  return (
    <AudioProvider>
      <Shell />
    </AudioProvider>
  );
}
function Shell() {
  const t = useT(),
    { settings, setSettings, toast, storageError } = useApp();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  useEffect(() => {
    const key = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
      if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setSettings((s) => ({
          ...s,
          uiLanguage: ["vi", "en", "both"][
            (["vi", "en", "both"].indexOf(s.uiLanguage) + 1) % 3
          ],
        }));
      }
      if (e.key === "Escape") {
        setSearch(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [setSettings]);
  return (
    <>
      <header className="topbar">
        <button
          className="mobile-menu"
          aria-label={t("nav.menu")}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          ☰
        </button>
        <Link className="brand" to="/">
          <span className="brand-icon">
            M<span>3</span>
          </span>
          <div>
            IELTS MINDSET <b>STUDY HUB</b>
          </div>
        </Link>
        <button className="search-trigger" onClick={() => setSearch(true)}>
          {t("search.label")} <kbd>Ctrl K</kbd>
        </button>
        <div className="language-switch" aria-label={t("language.interface")}>
          {["vi", "en", "both"].map((l) => (
            <button
              key={l}
              className={settings.uiLanguage === l ? "active" : ""}
              onClick={() => setSettings((s) => ({ ...s, uiLanguage: l }))}
            >
              {l === "vi" ? "🇻🇳 VI" : l === "en" ? "🇬🇧 EN" : "VI + EN"}
            </button>
          ))}
        </div>
      </header>
      <aside className={"sidebar " + (menu ? "open" : "")}>
        <nav>
          {navigation.map((n, i) => (
            <NavLink key={n} to={href(n)} end={n === "home"}>
              <span className="nav-icon">
                {["⌂", "▤", "♫", "✦", "✎", "◉", "◇", "◷", "▥", "⚙"][i]}
              </span>
              {t("nav." + n)}
            </NavLink>
          ))}
        </nav>
        <details className="contents">
          <summary>{t("nav.contents")}</summary>
          {units.map((u) => (
            <details key={u.unit}>
              <summary>{t("common.unit", { unit: u.unit })}</summary>
              {lessons
                .filter((l) => l.unit === u.unit)
                .map((l) => (
                  <details key={l.id}>
                    <summary>{t(l.displayKey)}</summary>
                    {l.exerciseIds.map((id) => {
                      const e = exercises.find((e) => e.id === id);
                      return (
                        e && (
                          <Link key={id} to={path(e)}>
                            {t("common.ex", { no: e.exerciseNo })}
                          </Link>
                        )
                      );
                    })}
                  </details>
                ))}
            </details>
          ))}
        </details>
        <div className="sidebar-footer">
          CAMBRIDGE · LEVEL 3<br />
          ENGLISH LANGUAGE SKILLS 5
        </div>
      </aside>
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/exercise/:id" element={<Exercise />} />
          <Route path="/audio" element={<AudioLibrary />} />
          <Route path="/examSkills" element={<ExamSkills />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/speaking" element={<Speaking />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/mock" element={<Mock />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Catalog />} />
        </Routes>
        <footer className="app-footer">
          {t("app.name")} · {t("common.partial")}
        </footer>
      </main>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {storageError && (
        <div className="storage-error" role="alert">
          {t("progress.storageFailed")}
        </div>
      )}
      {search && <Search close={() => setSearch(false)} />}
    </>
  );
}
function Title({ name, sub }) {
  const t = useT();
  return (
    <div className="page-title">
      <span className="eyebrow">IELTS MINDSET 3</span>
      <h1>{t(name)}</h1>
      {sub && <p>{t(sub)}</p>}
    </div>
  );
}
function Completion({ unit }) {
  const { progress } = useApp();
  const ids = new Set(
    progress.attempts.filter((a) => a.exerciseId).map((a) => a.exerciseId),
  );
  const list = exercises.filter((e) => e.unit === unit);
  const value = Math.round(
    (list.filter((e) => ids.has(e.id)).length / list.length) * 100,
  );
  return (
    <>
      <div className="meter">
        <span style={{ width: value + "%" }} />
      </div>
      <small>{value}%</small>
    </>
  );
}
function Home() {
  const t = useT(),
    { progress } = useApp();
  const resume = exercises.find((e) => e.id === progress.resume?.exerciseId);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{t("app.course")} · UNIT 01—05</span>
          <h1>
            IELTS MINDSET <em>STUDY HUB</em>
          </h1>
          <p>{t("home.ready")}</p>
          <div className="row">
            <Link
              className="button primary"
              to={resume ? path(resume) : "/catalog"}
            >
              {t("hero.start")} ↗
            </Link>
            <Link className="button" to="/audio">
              ♫ {t("hero.audio")}
            </Link>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-ring" />
          <div className="orb">
            M<span>3</span>
          </div>
          <span className="orbit-label">YOUR NEXT BAND</span>
          <i>READ · LISTEN · WRITE · SPEAK</i>
        </div>
      </section>
      <div className="stat-grid">
        {[
          [289, "stats.exercises"],
          [52, "stats.tracks"],
          [5, "stats.units"],
          [vocabulary.length, "stats.vocabulary"],
        ].map(([v, k]) => (
          <div className="stat" key={k}>
            <strong>{v.toLocaleString()}</strong>
            <span>{t(k)}</span>
          </div>
        ))}
      </div>
      <div className="notice">{t("source.coverage")}</div>
      {resume && (
        <section className="card continue">
          <span>{t("home.continue")}</span>
          <Link to={path(resume)}>{resume.sourceLabel} →</Link>
        </section>
      )}
      <div className="section-heading">
        <h2>{t("home.unitsTitle")}</h2>
        <Link to="/catalog">{t("catalog.open")} →</Link>
      </div>
      <div className="unit-grid">
        {units.map((u) => (
          <Link
            className="unit-card"
            key={u.unit}
            to={"/catalog?unit=" + u.unit}
          >
            <span className="unit-number">0{u.unit}</span>
            <span className="eyebrow">UNIT {u.unit}</span>
            <h3>
              <Bi en={u.title_en} vi={u.title_vi} />
            </h3>
            <p>
              {u.exerciseCount} {t("stats.exercises")} · 4 {t("filter.skill")}
            </p>
            <Completion unit={u.unit} />
            <span className="unit-arrow">↗</span>
          </Link>
        ))}
      </div>
      <section className="card assessment">
        <h2>{t("home.courseAssessment")}</h2>
        <div className="stat-grid">
          {[
            [30, "home.regular"],
            [20, "home.progressTest"],
            [50, "home.final"],
          ].map(([v, k]) => (
            <div key={k}>
              <strong>{v}%</strong>
              <p>{t(k)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
function Catalog() {
  const t = useT(),
    { progress } = useApp(),
    [params, setParams] = useSearchParams();
  const [skill, setSkill] = useState(""),
    [status, setStatus] = useState(""),
    [type, setType] = useState(""),
    [q, setQ] = useState("");
  const unit = params.get("unit") || "";
  const attempted = new Set(progress.attempts.map((a) => a.exerciseId));
  const wrong = new Set(
    progress.attempts
      .filter((a) => a.correct < a.gradableCount)
      .map((a) => a.exerciseId),
  );
  const list = exercises.filter(
    (e) =>
      (!unit || e.unit === +unit) &&
      (!skill || e.skills.includes(skill)) &&
      (!type || e.questionType === type) &&
      (!status ||
        (status === "completed" && attempted.has(e.id)) ||
        (status === "notStarted" && !attempted.has(e.id)) ||
        (status === "bookmarked" && progress.bookmarks.includes(e.id)) ||
        (status === "incorrect" && wrong.has(e.id))) &&
      normalizeSearch(e.sourceLabel + " " + pages[e.startPage]?.text).includes(
        normalizeSearch(q),
      ),
  );
  return (
    <>
      <Title name="catalog.title" sub="source.coverage" />
      <div className="filters">
        <input
          placeholder={t("search.placeholder")}
          aria-label={t("search.label")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          aria-label={t("filter.unit")}
          value={unit}
          onChange={(e) =>
            setParams(e.target.value ? { unit: e.target.value } : {})
          }
        >
          <option value="">{t("filter.allUnits")}</option>
          {units.map((u) => (
            <option key={u.unit} value={u.unit}>
              Unit {u.unit}
            </option>
          ))}
        </select>
        <select
          aria-label={t("filter.skill")}
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        >
          <option value="">{t("filter.allSkills")}</option>
          {[
            "reading",
            "listening",
            "writing",
            "speaking",
            "grammar",
            "vocabulary",
          ].map((s) => (
            <option key={s} value={s}>
              {t("skill." + s)}
            </option>
          ))}
        </select>
        <select
          aria-label={t("filter.type")}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">{t("filter.allTypes")}</option>
          {[...new Set(exercises.map((e) => e.questionType))].map((s) => (
            <option key={s} value={s}>
              {t("qtype." + s)}
            </option>
          ))}
        </select>
        <select
          aria-label={t("filter.status")}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t("filter.allStatuses")}</option>
          {["notStarted", "completed", "incorrect", "bookmarked"].map((s) => (
            <option key={s} value={s}>
              {t("status." + s)}
            </option>
          ))}
        </select>
        <select aria-label={t("filter.difficulty")}>
          <option>{t("filter.unknown")}</option>
        </select>
      </div>
      <p className="muted">{list.length} / 289</p>
      <div className="exercise-grid">
        {list.map((e) => (
          <Link className="card exercise-card" key={e.id} to={path(e)}>
            <span className="eyebrow">
              UNIT {e.unit} · {t("skill." + e.sourceSection.toLowerCase())}
            </span>
            <h3>{t("common.ex", { no: e.exerciseNo })}</h3>
            <span className={"badge " + (e.questions.length ? "green" : "")}>
              {t(
                e.questions.length ? "filter.objective" : "filter.sourceReview",
              )}
            </span>
            <p>
              {t("qtype." + e.questionType)} · {t("source.page")} {e.startPage}
            </p>
            {e.audioTracks.length > 0 && (
              <small>♫ {e.audioTracks.join(", ")}</small>
            )}
            {progress.bookmarks.includes(e.id) && <span> ★</span>}
          </Link>
        ))}
      </div>
    </>
  );
}
function QuestionInputs({ ex, answers, onChange, results, show = false }) {
  const t = useT();
  return (
    <div className="questions">
      {ex.questions.map((q) => {
        const result = results?.find((r) => r.questionId === q.id);
        return (
          <div className={"question " + (result?.status || "")} key={q.id}>
            <label htmlFor={q.id}>{t("question.number", { no: q.no })}</label>
            {["tfng", "ynng"].includes(q.inputType) ? (
              <select
                id={q.id}
                value={answers[q.id] || ""}
                onChange={(e) => onChange(q.id, e.target.value)}
              >
                <option value="">{t("exercise.answerPlaceholder")}</option>
                {(q.inputType === "tfng"
                  ? ["True", "False", "Not Given"]
                  : ["Yes", "No", "Not Given"]
                ).map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            ) : (
              <input
                id={q.id}
                lang="en"
                autoComplete="off"
                value={answers[q.id] || ""}
                onChange={(e) => onChange(q.id, e.target.value)}
                placeholder={t("exercise.answerPlaceholder")}
              />
            )}
            <span aria-live="polite">
              {result &&
                t(
                  "exercise." +
                    (result.status === "ungraded" ? "ungraded" : result.status),
                )}
            </span>
            {show && (
              <details open>
                <summary>
                  {t("solution.answer")}:{" "}
                  <strong lang="en">
                    {q.answerStatus === "verified"
                      ? q.answer
                      : t("status.needsChecking")}
                  </strong>
                </summary>
                <Bi en={q.explanation_en} vi={q.explanation_vi} />
                <p>
                  {t("source.reference")}: {q.evidence.locator},{" "}
                  {t("source.page")} {q.evidence.page}
                </p>
                <Link to="/examSkills">{t("solution.tips")} →</Link>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}
function Exercise() {
  const { id } = useParams();
  return <ExerciseBody key={id} id={id} />;
}
function ExerciseBody({ id }) {
  const t = useT(),
    app = useApp(),
    player = useAudio();
  const e = exercises.find((x) => x.id === id);
  const [show, setShow] = useState(false),
    [result, setResult] = useState(null);
  useEffect(() => {
    if (e) app.resume(id);
  }, [id]);
  if (!e) return <Title name="common.empty" />;
  const answers = app.progress.drafts[id]?.answers || {},
    response = app.progress.drafts[id]?.response || "";
  const change = (key, val) =>
    app.draft(id, { answers: { ...answers, [key]: val }, response });
  const ix = exercises.indexOf(e);
  const check = () => {
    const r = gradeExercise(e, answers);
    setResult(r);
    setShow(true);
    app.submit({
      exerciseId: id,
      unit: e.unit,
      skill: e.sourceSection.toLowerCase(),
      answers,
      response,
      ...r,
    });
    app.setToast(t("common.saved"));
  };
  return (
    <>
      <div className="breadcrumb">
        <Link to="/">{t("nav.home")}</Link> /{" "}
        <Link to={"/catalog?unit=" + e.unit}>Unit {e.unit}</Link> /{" "}
        {t("skill." + e.sourceSection.toLowerCase())}
      </div>
      <div className="row between">
        <Title name="exercise.label" />
        <button
          onClick={() => app.bookmark(id)}
          aria-pressed={app.progress.bookmarks.includes(id)}
        >
          {app.progress.bookmarks.includes(id) ? "★" : "☆"}{" "}
          {t(
            app.progress.bookmarks.includes(id)
              ? "exercise.removeBookmark"
              : "exercise.bookmark",
          )}
        </button>
      </div>
      <h2>{e.sourceLabel}</h2>
      <div className="notice">{t("source.notice")}</div>
      <div className="row">
        {e.audioTracks.map((n) => (
          <button
            key={n}
            onClick={() => player.choose(n)}
            disabled={!audio.some((a) => a.track === n)}
          >
            ♫ {t("audio.track")} {n}{" "}
            {!audio.some((a) => a.track === n) && t("audio.missing")}
          </button>
        ))}
      </div>
      <div className="exercise-layout">
        <SourceReader numbers={e.sourcePages} initial={e.startPage} />
        <section className="card answers-panel">
          <h2>{t("exercise.questions")}</h2>
          {e.questions.length ? (
            <QuestionInputs
              ex={e}
              answers={answers}
              onChange={change}
              results={result?.results}
              show={show}
            />
          ) : (
            <>
              <p>{t("exercise.noAuto")}</p>
              <textarea
                lang="en"
                placeholder={t("exercise.openResponse")}
                aria-label={t("exercise.openResponse")}
                value={response}
                onChange={(v) =>
                  app.draft(id, { answers, response: v.target.value })
                }
              />
            </>
          )}
          <div className="row">
            <button className="primary" onClick={check}>
              {t("exercise.check")}
            </button>
            <button onClick={() => setShow(!show)}>
              {t("exercise.showAnswers")}
            </button>
            <button
              onClick={() => {
                if (confirm(t("exercise.resetConfirm"))) {
                  app.draft(id, { answers: {}, response: "" });
                  setShow(false);
                  setResult(null);
                }
              }}
            >
              {t("exercise.reset")}
            </button>
          </div>
          {result && (
            <p role="status">
              {result.gradableCount
                ? t("common.score", {
                    correct: result.correct,
                    total: result.gradableCount,
                  })
                : t("exercise.ungraded")}
            </p>
          )}
          <label>
            {t("exercise.notes")}
            <textarea
              value={app.progress.notes[id] || ""}
              onChange={(v) => app.note(id, v.target.value)}
              placeholder={t("exercise.notesPlaceholder")}
            />
          </label>
        </section>
      </div>
      {show && (
        <section className="card">
          <h2>{t("source.key")}</h2>
          <p>{t("source.pending")}</p>
          <SourceReader numbers={e.answerKeyPages} reference />
        </section>
      )}
      <div className="row between">
        {ix > 0 ? (
          <Link className="button" to={path(exercises[ix - 1])}>
            ← {t("nav.previous")}
          </Link>
        ) : (
          <span />
        )}
        {ix < exercises.length - 1 && (
          <Link className="button" to={path(exercises[ix + 1])}>
            {t("nav.next")} →
          </Link>
        )}
      </div>
    </>
  );
}
function AudioLibrary() {
  const t = useT(),
    { choose, track } = useAudio();
  const [params] = useSearchParams();
  const [unit, setUnit] = useState(""),
    [q, setQ] = useState(params.get("track") || ""),
    [script, setScript] = useState(false),
    [translation, setTranslation] = useState(false);
  const list = audio.filter(
    (a) =>
      (!unit || (unit === "extra" ? a.unit === null : a.unit === +unit)) &&
      normalizeSearch(
        a.track + " " + a.originalName + " " + a.exerciseIds.join(" "),
      ).includes(normalizeSearch(q)),
  );
  const currentReq = requirements.find((r) => r.track === track?.track);
  const scriptPage = track?.audioscriptPage;
  return (
    <>
      <Title name="nav.audio" sub="audio.all" />
      <div className="filters">
        <input
          aria-label={t("search.label")}
          placeholder={t("search.placeholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          aria-label={t("filter.unit")}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option value="">{t("filter.allUnits")}</option>
          {units.map((u) => (
            <option key={u.unit} value={u.unit}>
              Unit {u.unit}
            </option>
          ))}
          <option value="extra">{t("audio.additional")}</option>
        </select>
      </div>
      <div className="notice">
        <strong>{t("audio.missingList")}</strong>:{" "}
        {requirements
          .filter((r) => r.availability === "missing")
          .map((r) => r.track)
          .join(", ")}
      </div>
      <div className="audio-grid">
        {list.map((a) => (
          <article
            key={a.id}
            className={
              "card track-card " + (track?.id === a.id ? "selected" : "")
            }
          >
            <div className="row between">
              <h2>
                {t("audio.track")} {a.track}
              </h2>
              <button
                onClick={() => choose(a.track)}
                aria-label={t("audio.play") + " " + a.track}
              >
                ▶
              </button>
            </div>
            <p>{a.unit ? "Unit " + a.unit : t("audio.additional")}</p>
            <small>
              {clock(a.durationSec)} · {(a.sizeBytes / 1e6).toFixed(2)} MB
            </small>
            <details>
              <summary>{t("audio.usedIn")}</summary>
              {a.exerciseIds.length ? (
                a.exerciseIds.map((id) => (
                  <Link key={id} to={"/exercise/" + id}>
                    {exercises.find((e) => e.id === id)?.sourceLabel}
                  </Link>
                ))
              ) : (
                <p>{t("audio.outsideScope")}</p>
              )}
              <p>{a.originalName}</p>
              <p>{t("audio.identityPending")}</p>
            </details>
          </article>
        ))}
      </div>
      {track && (
        <section className="card">
          <div className="row">
            <button onClick={() => setScript(!script)}>
              {t(script ? "audio.hideScript" : "audio.showScript")}
            </button>
            <button onClick={() => setTranslation(!translation)}>
              {t("audio.translate")}
            </button>
          </div>
          {translation && <p>{t("audio.scriptTranslation")}</p>}
          {script &&
            (scriptPage ? (
              <>
                <p>{t("audio.noCues")}</p>
                <SourceReader
                  key={scriptPage}
                  reference
                  numbers={[
                    scriptPage,
                    ...(references[scriptPage + 1] ? [scriptPage + 1] : []),
                  ]}
                />
              </>
            ) : (
              <p>{t("audio.noScript")}</p>
            ))}
        </section>
      )}
      <p>{t("audio.shortcuts")}</p>
    </>
  );
}
const skillPages = [
  [12, 18, 24, 29],
  [35, 41, 46, 51],
  [57, 64, 68, 72],
  [77, 83, 87, 92],
  [98, 104, 109, 113],
];
function ExamSkills() {
  const t = useT();
  const [unit, setUnit] = useState(1),
    [skill, setSkill] = useState(0);
  return (
    <>
      <Title name="examSkills.title" sub="examSkills.description" />
      <div className="notice">{t("examSkills.minor")}</div>
      <div className="filters">
        <select
          value={unit}
          onChange={(e) => setUnit(+e.target.value)}
          aria-label={t("filter.unit")}
        >
          {units.map((u) => (
            <option key={u.unit} value={u.unit}>
              Unit {u.unit}
            </option>
          ))}
        </select>
        <select
          value={skill}
          onChange={(e) => setSkill(+e.target.value)}
          aria-label={t("filter.skill")}
        >
          {["reading", "writing", "listening", "speaking"].map((s, i) => (
            <option key={s} value={i}>
              {t("skill." + s)}
            </option>
          ))}
        </select>
      </div>
      <SourceReader
        key={unit + "-" + skill}
        numbers={[skillPages[unit - 1][skill]]}
      />
      <section className="card">
        <h2>{t("examSkills.teacher")}</h2>
        {supplement.tips.map((tip) => (
          <details key={tip.id}>
            <summary>
              <Bi en={tip.title_en} vi={tip.title_vi} />
            </summary>
            <Bi en={tip.body_en} vi={tip.body_vi} />
          </details>
        ))}
      </section>
    </>
  );
}
function Writing() {
  const t = useT();
  const [task, setTask] = useState(2),
    [unit, setUnit] = useState(4),
    [model, setModel] = useState(false);
  const lesson = lessons.find(
    (l) => l.unit === unit && l.sourceSection === "Writing",
  );
  return (
    <>
      <Title name="nav.writing" />
      <div className="filters">
        <select
          aria-label={t("filter.unit")}
          value={unit}
          onChange={(e) => setUnit(+e.target.value)}
        >
          {units.map((u) => (
            <option key={u.unit} value={u.unit}>
              Unit {u.unit}
            </option>
          ))}
        </select>
        <div className="row">
          {[1, 2].map((n) => (
            <button
              key={n}
              className={task === n ? "active" : ""}
              onClick={() => setTask(n)}
            >
              {t("writing.task" + n)}
            </button>
          ))}
        </div>
      </div>
      <div className="notice">{t("writing.source")}</div>
      <div className="exercise-layout">
        <SourceReader
          key={unit}
          numbers={Array.from(
            {
              length:
                lesson.source.printedPages[1] -
                lesson.source.printedPages[0] +
                1,
            },
            (_, i) => lesson.source.printedPages[0] + i,
          )}
        />
        <WritingDesk key={task} task={task} />
      </div>
      <section className="card">
        <h2>{t("writing.bookSource")}</h2>
        <SourceReader
          reference
          key={"key" + unit}
          numbers={
            unit === 1
              ? [184, 185]
              : unit === 2
                ? [187, 188]
                : unit === 3
                  ? [190, 191]
                  : unit === 4
                    ? [192, 193]
                    : [196, 197]
          }
        />
      </section>
      <section className="card">
        <button onClick={() => setModel(!model)}>
          {t("writing.supplement")}
        </button>
        {model && (
          <>
            <p>{t("writing.supplementNotice")}</p>
            <h3 lang="en">{supplement.prompt_en}</h3>
            <Bi en={supplement.model_en} vi={supplement.model_vi} />
            <h3>{t("writing.outline")}</h3>
            <Bi en={supplement.outline_en} vi={supplement.outline_vi} />
            <h3>{t("writing.analysis")}</h3>
            {supplement.analysis.map((a) => (
              <div key={a.criterion}>
                <h4>{t("criteria." + a.criterion)}</h4>
                <Bi en={a.analysis_en} vi={a.analysis_vi} />
              </div>
            ))}
          </>
        )}
      </section>
    </>
  );
}
function WritingDesk({ task }) {
  const t = useT(),
    { progress, draft } = useApp(),
    timer = useDeadline("writing-" + task, task === 1 ? 1200 : 2400);
  const val = progress.drafts["writing-" + task]?.response || "";
  return (
    <section className="card writing-desk">
      <h2>{t("writing.task" + task)}</h2>
      <div className="row between">
        <strong className="timer" role="timer">
          {clock(timer.left)}
        </strong>
        <button onClick={timer.start} disabled={timer.running}>
          {t("writing.startTimer")}
        </button>
        <button onClick={timer.reset}>{t("common.reset")}</button>
      </div>
      <textarea
        lang="en"
        aria-label={t("writing.draft")}
        placeholder={t("writing.draftPlaceholder")}
        value={val}
        onChange={(e) => draft("writing-" + task, { response: e.target.value })}
      />
      <p>
        {t("writing.wordCount")}: <strong>{wordCount(val)}</strong> /{" "}
        {task === 1 ? 150 : 250}
      </p>
      <p className="muted">{t("writing.noAutomaticBand")}</p>
      {timer.expired && <p role="status">{t("mock.expired")}</p>}
    </section>
  );
}
const speakingCards = [
  {
    id: "rural",
    unit: 1,
    page: 26,
    prompt: "Describe a rural town or village you plan to visit.",
  },
  {
    id: "city",
    unit: 1,
    page: 29,
    prompt: "Describe a city you have lived in.",
  },
  {
    id: "artist",
    unit: 3,
    page: 69,
    prompt: "Describe a creative person whose work you admire.",
  },
  {
    id: "museum",
    unit: 3,
    page: 72,
    prompt: "Describe a museum or gallery that you have visited.",
  },
  {
    id: "purchase",
    unit: 4,
    page: 92,
    prompt: "Describe an expensive item that you bought.",
  },
  {
    id: "event",
    unit: 5,
    page: 111,
    prompt: "Describe a historical event that you find interesting.",
  },
  {
    id: "person",
    unit: 5,
    page: 113,
    prompt: "Describe an interesting historical person.",
  },
];
function Speaking() {
  const t = useT();
  const [card, setCard] = useState(speakingCards[0].id);
  const topic = speakingCards.find((c) => c.id === card);
  return (
    <>
      <Title name="nav.speaking" />
      <select
        value={card}
        aria-label={t("speaking.cards")}
        onChange={(e) => setCard(e.target.value)}
      >
        {speakingCards.map((c) => (
          <option key={c.id} value={c.id}>
            Unit {c.unit} · {c.prompt}
          </option>
        ))}
      </select>
      <div className="notice">
        {t("source.original")} · {t("source.page")} {topic.page}
      </div>
      <div className="exercise-layout">
        <SourceReader key={card} numbers={[topic.page]} />
        <SpeakingDesk key={card} topic={topic} />
      </div>
    </>
  );
}
function SpeakingDesk({ topic }) {
  const t = useT(),
    { progress, draft, setToast } = useApp();
  const timer = useDeadline("speaking-" + topic.id, 180),
    [recording, setRecording] = useState(false),
    [url, setURL] = useState("");
  const recorder = useRef(null),
    stream = useRef(null),
    chunks = useRef([]);
  useEffect(() => {
    let live = true;
    readRecording(topic.id)
      .then((b) => {
        if (b && live) setURL(URL.createObjectURL(b));
      })
      .catch(() => {});
    return () => {
      live = false;
      recorder.current?.state === "recording" && recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, [topic.id]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  const record = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        setToast(t("speaking.unsupported"));
        return;
      }
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      chunks.current = [];
      recorder.current = new MediaRecorder(stream.current);
      recorder.current.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      recorder.current.onstop = async () => {
        const blob = new Blob(chunks.current, {
          type: recorder.current.mimeType,
        });
        setURL(URL.createObjectURL(blob));
        stream.current.getTracks().forEach((t) => t.stop());
        try {
          await storeRecording(topic.id, blob);
        } catch {
          setToast(t("progress.storageFailed"));
        }
        setRecording(false);
      };
      recorder.current.start();
      setRecording(true);
    } catch {
      setToast(t("speaking.denied"));
    }
  };
  return (
    <section className="card">
      <h2>{t("speaking.countdown")}</h2>
      <strong className="timer">
        {timer.left > 120 ? t("speaking.prepare") : t("speaking.speak")}{" "}
        {clock(timer.left > 120 ? timer.left - 120 : timer.left)}
      </strong>
      <div className="row">
        <button disabled={timer.running} onClick={timer.start}>
          {t("common.start")}
        </button>
        <button onClick={timer.reset}>{t("common.reset")}</button>
        <button onClick={recording ? () => recorder.current.stop() : record}>
          {t(recording ? "speaking.stop" : "speaking.record")}
        </button>
      </div>
      {url ? (
        <>
          <audio controls src={url} />
          <a
            className="button"
            href={url}
            download={"speaking-" + topic.id + ".webm"}
          >
            {t("speaking.download")}
          </a>
        </>
      ) : (
        <p>{t("speaking.noRecording")}</p>
      )}
      <h3>{t("speaking.rubric")}</h3>
      <p>{t("speaking.rubricNotice")}</p>
      {["grammar", "pronunciation", "vocabulary", "background", "fluency"].map(
        (k) => (
          <label className="rubric" key={k}>
            {t("rubric." + k)}
            <select
              aria-label={t("rubric." + k)}
              value={progress.drafts["rubric-" + topic.id]?.[k] || ""}
              onChange={(e) =>
                draft("rubric-" + topic.id, {
                  ...progress.drafts["rubric-" + topic.id],
                  [k]: +e.target.value,
                })
              }
            >
              <option value="">—</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} · {t("rubric.level" + n)}
                </option>
              ))}
            </select>
          </label>
        ),
      )}
    </section>
  );
}
function Vocabulary() {
  const t = useT();
  const [params] = useSearchParams();
  const [unit, setUnit] = useState(Number(params.get("unit")) || 1),
    [direction, setDirection] = useState("enVi"),
    [index, setIndex] = useState(0),
    [flip, setFlip] = useState(false),
    [quiz, setQuiz] = useState(false),
    [answer, setAnswer] = useState("");
  const list = vocabulary.filter((v) => v.unit === unit),
    v = list[index % list.length];
  const front =
    direction === "enVi"
      ? v.word
      : direction === "viEn"
        ? v.meaning_vi
        : v.meaning_en;
  const back = direction === "enVi" ? v.meaning_vi : v.word;
  return (
    <>
      <Title name="nav.vocabulary" sub="vocabulary.teacher" />
      <div className="filters">
        <select
          aria-label={t("filter.unit")}
          value={unit}
          onChange={(e) => {
            setUnit(+e.target.value);
            setIndex(0);
            setFlip(false);
            setAnswer("");
          }}
        >
          {units.map((u) => (
            <option key={u.unit} value={u.unit}>
              Unit {u.unit}
            </option>
          ))}
        </select>
        <select
          aria-label={t("vocabulary.direction")}
          value={direction}
          onChange={(e) => {
            setDirection(e.target.value);
            setFlip(false);
            setAnswer("");
          }}
        >
          {["enVi", "viEn", "definitionWord"].map((d) => (
            <option key={d} value={d}>
              {t("vocabulary." + d)}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setQuiz(!quiz);
            setAnswer("");
          }}
        >
          {t("vocabulary.quiz")}
        </button>
      </div>
      <div className="flashcard card">
        <span className="eyebrow">
          {(index % list.length) + 1} / {list.length}
        </span>
        <h2>{flip ? back : front}</h2>
        {flip && (
          <>
            <p lang="en">
              {v.ipa} · {v.pos}
            </p>
            <Bi en={v.example_en} vi={v.example_vi} />
          </>
        )}
        {quiz && (
          <>
            <input
              aria-label={t("vocabulary.word")}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            {answer && (
              <p>
                {t(
                  normalizeSearch(answer) === normalizeSearch(back)
                    ? "exercise.correct"
                    : "exercise.incorrect",
                )}
              </p>
            )}
          </>
        )}
        <div className="row center">
          <button onClick={() => setFlip(!flip)}>{t("vocabulary.flip")}</button>
          <button
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(v.word);
              utterance.lang = "en-GB";
              speechSynthesis.speak(utterance);
            }}
          >
            {t("vocabulary.pronounce")}
          </button>
          <button
            onClick={() => {
              setIndex(index + 1);
              setFlip(false);
              setAnswer("");
            }}
          >
            {t("nav.next")} →
          </button>
        </div>
      </div>
      <div className="exercise-grid">
        {list.map((v) => (
          <article className="card" key={v.word}>
            <h3 lang="en">{v.word}</h3>
            <p>
              {v.ipa} · {v.pos}
            </p>
            <Bi en={v.meaning_en} vi={v.meaning_vi} />
            <small>
              <Bi en={v.example_en} vi={v.example_vi} />
            </small>
          </article>
        ))}
      </div>
    </>
  );
}
function Mock() {
  const t = useT();
  const [mode, setMode] = useState("final");
  return (
    <>
      <Title name="nav.mock" sub="mock.practice" />
      <div className="row">
        {["final", "progress"].map((m) => (
          <button
            key={m}
            className={mode === m ? "active" : ""}
            onClick={() => setMode(m)}
          >
            {t("mock." + m)}
          </button>
        ))}
      </div>
      <MockPaper key={mode} mode={mode} />
    </>
  );
}
function MockPaper({ mode }) {
  const t = useT(),
    app = useApp(),
    player = useAudio();
  const selected =
    mode === "final"
      ? ["u1-reading-ex-18", "u2-reading-ex-17", "u3-reading-ex-16"]
      : ["u5-listening-ex-13"];
  const items = selected.map((id) => exercises.find((e) => e.id === id));
  const key = "mock-" + mode,
    draft = app.progress.drafts[key] || {},
    answers = draft.answers || {};
  const timer = useDeadline(key, mode === "final" ? 5400 : 1200);
  const [results, setResults] = useState(
    draft.submitted
      ? items.map((e) => ({ exerciseId: e.id, ...gradeExercise(e, answers) }))
      : null,
  );
  const submit = () => {
    if (draft.submitted) return;
    const rr = items.map((e) => ({
      exerciseId: e.id,
      ...gradeExercise(e, answers),
    }));
    setResults(rr);
    app.draft(key, { ...draft, submitted: true });
    app.submit({
      type: "mock",
      mode,
      skill: mode === "final" ? "reading" : "listening",
      answers,
      response: draft.response || "",
      correct: rr.reduce((a, r) => a + r.correct, 0),
      gradableCount: rr.reduce((a, r) => a + r.gradableCount, 0),
      results: rr.flatMap((r) => r.results),
    });
    app.setToast(t("mock.done"));
  };
  useEffect(() => {
    if (timer.expired && !draft.submitted) submit();
  }, [timer.expired]);
  const start = () => {
    app.draft(key, { ...draft, started: true });
    timer.start();
  };
  return (
    <section className="card mock-paper">
      <p lang="en">{t("mock.instructions", {}, "en")}</p>
      <div className="row">
        <strong className="timer">{clock(timer.left)}</strong>
        <button disabled={timer.running || draft.submitted} onClick={start}>
          {t("mock.start")}
        </button>
        <button
          disabled={!draft.started || draft.submitted}
          onClick={() => {
            if (confirm(t("mock.confirm"))) submit();
          }}
        >
          {t("mock.submit")}
        </button>
        <button
          onClick={() => {
            if (confirm(t("exercise.resetConfirm"))) {
              app.draft(key, {});
              timer.reset();
              setResults(null);
            }
          }}
        >
          {t("exercise.reset")}
        </button>
      </div>
      {mode === "progress" && (
        <>
          <button
            disabled={!draft.started || draft.submitted || draft.listened}
            onClick={() => {
              app.draft(key, { ...draft, listened: true });
              player.choose("41", key + timer.deadline);
            }}
          >
            ▶ Track 41 · {t("audio.onePlay")}
          </button>
          <h3 lang="en">Speaking Part 1</h3>
          <p lang="en">
            Topic 1: Countryside. Topic 2: Food. Use the original questions on
            pages 25 and 47; choose two from each topic. Question selection: ⚠
            Needs checking.
          </p>
          <SourceReader numbers={[25, 47]} />
        </>
      )}
      {draft.started &&
        items.map((e) => (
          <div key={e.id}>
            <h3 lang="en">{e.sourceLabel}</h3>
            <SourceReader numbers={e.sourcePages} initial={e.startPage} />
            <fieldset disabled={draft.submitted}>
              <QuestionInputs
                ex={e}
                answers={answers}
                onChange={(k, v) =>
                  app.draft(key, { ...draft, answers: { ...answers, [k]: v } })
                }
                results={results?.find((r) => r.exerciseId === e.id)?.results}
                show={!!draft.submitted}
              />
            </fieldset>
          </div>
        ))}
      {mode === "final" && draft.started && (
        <>
          <h3 lang="en">Writing Task 2</h3>
          <p lang="en">
            Use the exam task on page 83. Write at least 250 words.
          </p>
          <SourceReader numbers={[83]} />
          <textarea
            lang="en"
            disabled={draft.submitted}
            aria-label={t("writing.draft")}
            value={draft.response || ""}
            onChange={(e) =>
              app.draft(key, { ...draft, response: e.target.value })
            }
          />
          <p>
            {t("writing.wordCount")}: {wordCount(draft.response)}
          </p>
        </>
      )}
      {draft.submitted && <p role="status">{t("mock.done")}</p>}
    </section>
  );
}
function Progress() {
  const t = useT(),
    app = useApp();
  const attempts = app.progress.attempts,
    done = new Set(
      attempts.filter((a) => a.exerciseId).map((a) => a.exerciseId),
    );
  const count = attempts.reduce((a, r) => a + (r.gradableCount || 0), 0),
    correct = attempts.reduce((a, r) => a + (r.correct || 0), 0);
  return (
    <>
      <Title name="nav.progress" sub="progress.local" />
      <div className="stat-grid">
        {[
          [attempts.length, "progress.attempts"],
          [done.size, "progress.reviewed"],
          [
            count ? Math.round((correct / count) * 100) + "%" : "—",
            "progress.accuracy",
          ],
        ].map(([v, k]) => (
          <div className="stat" key={k}>
            <strong>{v}</strong>
            <span>{t(k)}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <h2>{t("filter.skill")}</h2>
        {["reading", "writing", "listening", "speaking"].map((s) => {
          const total = exercises.filter(
              (e) => e.sourceSection.toLowerCase() === s,
            ).length,
            n = exercises.filter(
              (e) => e.sourceSection.toLowerCase() === s && done.has(e.id),
            ).length;
          return (
            <div className="skill-progress" key={s}>
              <label>
                {t("skill." + s)}{" "}
                <span>
                  {n}/{total}
                </span>
              </label>
              <div className="meter">
                <span style={{ width: (n / total) * 100 + "%" }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="row">
        <button onClick={() => downloadJSON(app.exportData())}>
          {t("progress.export")}
        </button>
        <label className="button">
          {t("progress.import")}
          <input
            className="file-input"
            type="file"
            accept="application/json,.json"
            aria-label={t("progress.importLabel")}
            onChange={async (e) => {
              try {
                const f = e.target.files[0];
                if (!f || f.size > 10e6) throw Error();
                const d = validateExport(JSON.parse(await f.text()));
                app.setProgress((p) => ({
                  attempts: [
                    ...new Map(
                      [...p.attempts, ...d.attempts].map((a) => [a.id, a]),
                    ).values(),
                  ],
                  drafts: { ...p.drafts, ...d.drafts },
                  bookmarks: [...new Set([...p.bookmarks, ...d.bookmarks])],
                  notes: { ...p.notes, ...d.notes },
                  resume: d.resume || p.resume,
                }));
                app.setToast(t("progress.imported"));
              } catch {
                app.setToast(t("progress.invalid"));
              }
              e.target.value = "";
            }}
          />
        </label>
        <Link className="button" to="/catalog">
          {t("progress.wrong")}
        </Link>
      </div>
      <section className="card">
        <h2>{t("progress.attempts")}</h2>
        {!attempts.length && <p>{t("progress.empty")}</p>}
        {attempts
          .slice(-30)
          .reverse()
          .map((a) => (
            <div className="history-row" key={a.id}>
              <Link to={a.exerciseId ? "/exercise/" + a.exerciseId : "/mock"}>
                {a.exerciseId || t("mock." + a.mode)}
              </Link>
              <span>
                {a.gradableCount
                  ? t("common.score", {
                      correct: a.correct,
                      total: a.gradableCount,
                    })
                  : t("exercise.ungraded")}
              </span>
              <time>
                {new Intl.DateTimeFormat(
                  app.settings.uiLanguage === "vi" ? "vi-VN" : "en-GB",
                  { dateStyle: "short", timeStyle: "short" },
                ).format(new Date(a.submittedAt))}
              </time>
            </div>
          ))}
      </section>
    </>
  );
}
function Settings() {
  const t = useT(),
    { settings, setSettings } = useApp();
  const set = (key, v) => setSettings((s) => ({ ...s, [key]: v }));
  return (
    <>
      <Title name="nav.settings" />
      <section className="card settings">
        <label>
          {t("language.interface")}
          <select
            value={settings.uiLanguage}
            onChange={(e) => set("uiLanguage", e.target.value)}
          >
            {["vi", "en", "both"].map((l) => (
              <option key={l} value={l}>
                {t("language." + l)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("language.solutions")}
          <select
            value={settings.solutionLanguage}
            onChange={(e) => set("solutionLanguage", e.target.value)}
          >
            {["follow", "vi", "en", "both"].map((l) => (
              <option key={l} value={l}>
                {t("language." + l)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("settings.theme")}
          <select
            value={settings.theme}
            onChange={(e) => set("theme", e.target.value)}
          >
            {["dark", "light"].map((l) => (
              <option key={l} value={l}>
                {t("settings." + l)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("settings.fontSize")}
          <input
            type="range"
            min="16"
            max="26"
            step="1"
            value={settings.fontSize}
            onChange={(e) => set("fontSize", +e.target.value)}
          />
          {settings.fontSize}px
        </label>
        <p>{t("language.shortcut")}</p>
        <p>{t("audio.shortcuts")}</p>
        <p>{t("settings.notice")}</p>
        <a
          href={asset("coverage-report.json")}
          target="_blank"
          rel="noreferrer"
        >
          {t("settings.coverage")} ↗
        </a>
      </section>
    </>
  );
}
const searchDocuments = [
  ...exercises.map((e) => ({
    id: e.id,
    url: path(e),
    title: e.sourceLabel,
    text:
      e.sourceLabel +
      " " +
      e.explanation_en +
      " " +
      e.explanation_vi +
      " " +
      e.sourcePages.map((n) => pages[n]?.text).join(" ") +
      " " +
      e.questions.map((q) => q.answer + " " + q.explanation_vi).join(" "),
  })),
  ...audio.map((a) => ({
    id: a.id,
    url: "/audio?track=" + a.track,
    title: "Track " + a.track,
    text: a.track + " " + a.originalName + " " + a.exerciseIds.join(" "),
  })),
  ...units.map((u) => ({
    id: "unit-" + u.unit,
    url: "/catalog?unit=" + u.unit,
    title: "Unit " + u.unit + " · " + u.title_en,
    text: u.title_en + " " + u.title_vi,
  })),
  ...Object.entries(references).map(([n, p]) => ({
    id: "source-" + n,
    url: +n >= 206 ? "/audio" : "/catalog",
    title: "Source page " + n,
    text: p.text,
  })),
  ...vocabulary.map((v) => ({
    id: v.word,
    url: "/vocabulary?unit=" + v.unit,
    title: v.word,
    text:
      v.word +
      " " +
      v.meaning_en +
      " " +
      v.meaning_vi +
      " " +
      v.example_en +
      " " +
      v.example_vi,
  })),
].map((d) => ({ ...d, normalized: normalizeSearch(d.text) }));
const fuse = new Fuse(searchDocuments, {
  keys: ["normalized"],
  threshold: 0.25,
  ignoreLocation: true,
  minMatchCharLength: 2,
});
function Search({ close }) {
  const t = useT(),
    [q, setQ] = useState(""),
    ref = useRef();
  const list =
    q.trim().length >= 2 ? fuse.search(normalizeSearch(q)).slice(0, 20) : [];
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        className="search-modal card"
        role="dialog"
        aria-modal="true"
        aria-label={t("search.label")}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            const nodes = [
              ...e.currentTarget.querySelectorAll("input,button,a"),
            ];
            const first = nodes[0],
              last = nodes.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="row">
          <input
            ref={ref}
            aria-label={t("search.label")}
            placeholder={t("search.placeholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={close}>{t("common.close")}</button>
        </div>
        <p>{t("search.help")}</p>
        <div className="search-results">
          {list.map(({ item }) => (
            <Link key={item.id} to={item.url} onClick={close}>
              <mark>{item.title}</mark>
              <small>{item.text.slice(0, 130)}…</small>
            </Link>
          ))}
          {q.length >= 2 && !list.length && <p>{t("search.none")}</p>}
        </div>
      </section>
    </div>
  );
}
export default App;
