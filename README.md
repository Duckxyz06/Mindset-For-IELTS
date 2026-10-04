# IELTS Mindset 3 – Study Hub

Study hub for English Language Skills 5, based on Cambridge Mindset for IELTS Level 3, Units 1–5.

## Current status

Stage 1: source and audio inventory. The application has not been implemented or deployed yet.

- [Stage 1 report](docs/stage-1/STAGE_1_REPORT.md)
- [Exercise checklist](docs/stage-1/exercise-checklist.csv): 289 numbered exercises.
- [Audio inventory](docs/stage-1/audio-inventory.csv): 52 MP3 files, 54,970,816 bytes.
- [Structured inventory](docs/stage-1/audio-inventory.json)
- [Decode verification](docs/stage-1/audio-decode-check.json): all 52 files decode successfully.

The ZIP supplied by the user contains 27 of the 43 tracks referenced in Units 1–5. Required tracks 02–08, 10–13, 22–24 and 29–30 are missing. The other 25 available tracks are outside Units 1–5. Audio content matching still needs listening verification.

No textbook PDF, original ZIP, application source or audio binary is included in this stage. Audio integration and the first application build follow the user's staged approval process.

## Planned stack

React + Vite + Tailwind CSS, i18next/react-i18next, client-side search, HashRouter, and local progress storage. Planned GitHub Pages base: `/Mindset-For-IELTS/`.

Run instructions, content/translation/audio contribution guidance and deployment workflow will be added when the application is implemented.

## Data rules

Preserve original Unit, section, Exercise and Track numbers. Use the textbook Answer Key and Listening Scripts as answer sources. Unverified content must display “⚠ Cần kiểm tra / ⚠ Needs checking”. Original IELTS practice text remains English across interface languages.
