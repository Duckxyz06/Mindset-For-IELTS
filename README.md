# IELTS Mindset 3 – Study Hub

React + Vite + Tailwind CSS, static study application for English Language Skills 5. UI: Vietnamese, English, or both; solutions can use a separate language. Original IELTS practice content stays in English.

> **Content verification is incomplete.** This release makes all Unit 1–5 source pages and 289 exercise entries accessible, but it does not claim that all 289 exercises have complete interactive questions or verified bilingual explanations. Unknown material is labelled **⚠ Needs checking / ⚠ Cần kiểm tra**. See `public/coverage-report.json` and `docs/CONTENT_STATUS.md`.

## Run

Node.js 22 or later:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

For preview, open `/Mindset-For-IELTS/`. The application uses `HashRouter` and `base: '/Mindset-For-IELTS/'`; assets use `import.meta.env.BASE_URL`.

## Features

- Dashboard, Unit → section → exercise table of contents, filters, bookmarks and personal notes.
- Original source pages, charts and maps; accessible extracted English text.
- 391 checked objective answer entries from the supplied Answer Key. Other answers stay ungraded. Details and evidence are explicitly pending verification.
- All 52 supplied MP3 tracks, 54,970,816 bytes, unchanged SHA-256 hashes. 27 tracks map to Units 1–5; 25 additional tracks remain accessible. 16 required Unit 1–5 tracks are absent from the supplied ZIP.
- Persistent player: ±5 seconds, speed, A–B repeat, keyboard controls. Original script page viewer. Script translation and timed cues remain pending.
- Writing drafts, word counts and 20/40-minute timers; original book models and one teacher-authored Task 2 supplement.
- Seven source topic cards, 1-minute preparation + 2-minute speaking countdown, microphone recording/playback/download, browser IndexedDB storage, course self-assessment rubric (1–4).
- 30 teacher-authored vocabulary entries, flashcards, three review directions, mini-quiz and browser pronunciation.
- Assembled final practice (Reading + Task 2, 90 minutes) and progress practice with available Track 41. These are **practice papers**, not official course exams.
- Browser progress, skill charts, JSON export/import with safe merging. Recording blobs are separate; download them individually.

## Structure

```text
src/App.jsx                    routes and study screens
src/components/                original page reader and persistent player
src/lib/                       i18n context, grading, storage, data loader
src/locales/en.json, vi.json    all translatable UI strings
src/data/unit-1.json … unit-5.json
src/data/audio-manifest.json   file/track/exercise mapping, duration, hash
src/data/source-pages.json     source page text and image paths
public/source-pages/           original book page images
public/audio/                  all supplied audio
public/coverage-report.json    unresolved material, missing/unmatched tracks
scripts/validate-data.mjs      locale, source and audio integrity checks
.github/workflows/deploy.yml   test, build, GitHub Pages deployment
```

The book has Reading/Writing/Listening/Speaking sections, not numbered Lesson 1.1 etc. Source section names and Exercise numbers are retained; internal IDs are stable.

## Add or correct content

1. Edit the appropriate `src/data/unit-N.json`; keep original Exercise and question labels.
2. Transcribe the question from the book and the answer from its Answer Key. Record the printed source page in `evidence.page`.
3. Set `answerStatus: "verified"` only after checking the source and question alignment. `acceptedAnswers` contains only supported variants. Unknown answers use `needs_checking` and are excluded from automatic scoring.
4. Add paired `explanation_en` / `explanation_vi`, `tips_en` / `tips_vi`. A detailed explanation must cite the original passage/script location. Until reviewed, retain the warning marker.
5. Update `public/coverage-report.json`; run the tests and build.

## Add translations

Add the same key to `src/locales/en.json` and `vi.json`. Components use `useT()` / `t('key')`; `Bi` displays EN then VI in bilingual solutions. Keys are flat (`keySeparator: false`). Never translate original IELTS passages, prompts or models in place; translations belong in separate fields.

## Add audio

Copy the supplied original into `public/audio/unitN/track-XX.mp3`, or `additional/` when no match is confirmed. Add original name, file path, size, duration, SHA-256 and **checked** Exercise references to `src/data/audio-manifest.json`. Do not invent a mapping. Add script source pages when verified. Keep unavailable references in `audio-requirements.json`.

The supplied files are well below 100 MB each and their total is about 55 MB; Git LFS is not used. Original ZIPs and PDFs are excluded from Git.

## GitHub Pages

Repository: https://github.com/Duckxyz06/Mindset-For-IELTS

**One repository setting is required:** Settings → Pages → Build and deployment → Source → **GitHub Actions**. The connector cannot change this administrative setting. Run the `Build and deploy Study Hub` workflow if the previous deploy failed before Pages was enabled.

Intended URL: https://duckxyz06.github.io/Mindset-For-IELTS/

The workflow tests, validates all original audio hashes, builds, uploads `dist`, then deploys to Pages. No passwords or tokens are stored in this repository.

## Source and verification

Source: user-supplied Cambridge *Mindset for IELTS Level 3 – Student's Book*, supplied audio archive, and English Skills 5 course document. Supplements are labelled teacher-authored. Course rubric is not an IELTS band conversion. Writing descriptors reference: https://ielts.org/cdn/ielts-guides/ielts-writing-band-descriptors.pdf . Do not infer automatic Writing/Speaking bands from this app.

See `docs/stage-1` for source/audio audit and `design/stage-2` for the data/i18n/wireframe design.
