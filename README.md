# IELTS Mindset 3 – Study Hub

Study hub for English Language Skills 5, based on Cambridge Mindset for IELTS Level 3, Units 1–5.

## Current status

Stage 2: data contracts, localization and an interactive wireframe. The application has not been implemented or deployed yet.

- [Stage 1 report](docs/stage-1/STAGE_1_REPORT.md)
- [Exercise checklist](docs/stage-1/exercise-checklist.csv): 289 numbered exercises.
- [Audio inventory](docs/stage-1/audio-inventory.csv): 52 MP3 files, 54,970,816 bytes.
- [Structured inventory](docs/stage-1/audio-inventory.json)
- [Decode verification](docs/stage-1/audio-decode-check.json): all 52 files decode successfully.

The ZIP supplied by the user contains 27 of the 43 tracks referenced in Units 1–5. Required tracks 02–08, 10–13, 22–24 and 29–30 are missing. The other 25 available tracks are outside Units 1–5. Audio content matching still needs listening verification.

No textbook PDF, original ZIP, production application or audio binary is included in this stage. Audio integration and the first application build follow the user's staged approval process.

## Planned stack

React + Vite + Tailwind CSS, i18next/react-i18next, client-side search, HashRouter, and local progress storage. Planned GitHub Pages base: `/Mindset-For-IELTS/`.

Run instructions, content/translation/audio contribution guidance and deployment workflow will be added when the application is implemented.

## Data rules

Preserve original Unit, section, Exercise and Track numbers. Use the textbook Answer Key and Listening Scripts as answer sources. Unverified content must display “⚠ Cần kiểm tra / ⚠ Needs checking”. Original IELTS practice text remains English across interface languages.

## Stage 2 design

- [Design report](design/stage-2/DESIGN_REPORT.md)
- [Interactive wireframe source](design/stage-2/prototype/wireframe.html): download and open locally; no server required. This is a layout preview, not the production app.
- [Data contract](design/stage-2/DATA_CONTRACT.md)
- [i18n specification](design/stage-2/I18N_SPEC.md): 250 paired EN/VI UI keys.
- [Audio specification](design/stage-2/AUDIO_SPEC.md): 52 real assets and 43 course track requirements.
- [Architecture](design/stage-2/ARCHITECTURE.md) and [acceptance plan](design/stage-2/QA_PLAN.md).
- [Validation results](design/stage-2/validation): JSON/schema/hash checks and 132 desktop/mobile/language/theme layout checks.

Production React implementation, verified Unit 1 exercise content, and audio binary integration start in Stage 3 after design approval.
