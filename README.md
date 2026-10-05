# Mindset for IELTS · Level 3 · Units 1–6

A complete static study website, redesigned in the colourful Vietnamese/English study-card style of [Phonology](https://github.com/Duckxyz06/Phonology-).

## Study content

- 6 units, 24 Reading / Writing / Listening / Speaking lessons.
- All 131 original teaching pages, printed pages 8–138, from the supplied Student’s Book PDF.
- 347 numbered exercise workspaces. Questions, passages, tables, pictures, charts, TIP boxes and EXAM SKILLS remain intact on the source pages.
- Original Answer Key excerpts for each skill, placed **after** its teaching content. Includes the original model essays and open-task sample answers.
- Listening Scripts for Units 1–6; original audio files available in the previous repository are retained as learning assets.
- Vietnamese/English navigation and learning objectives; source lessons remain in their original English.
- Device-local saving of answers and self-review progress, answer checks for transcribed fixed-answer questions, selectable source text, zoom and download of answers.

All previous application source has been replaced. Only relevant original learning assets and checked fixed-answer data were carried into the new site.

## Run

```sh
npm test
npm run build
npm run dev
```

Open `http://localhost:8765`. No packages need to be installed. Serve through HTTP; `file://` cannot load lesson JSON files. GitHub Actions validates, builds and deploys `dist/` to GitHub Pages when `main` changes.

All paths are relative, including hash navigation, so the app works under `/Mindset-For-IELTS/`.

## Content and assessment notes

The page images are the source of truth. Extracted selectable PDF text can contain OCR errors. Fixed-answer inputs only use checked transcriptions; other exercises provide an open response area and the original key for self-review. This site does not assign an IELTS band score to Writing or Speaking.

Missing original audio files: **02, 03, 04, 05, 06, 07, 08, 10, 11, 12, 13, 22, 23, 24, 29, 30**. These are visibly labelled in the player area and have the original Listening Scripts available. Other unrelated Unit 7–8 audio files were removed.

Answers and progress are saved only in this browser; they are not sent to GitHub or any server. Use “Download answers” to keep a copy outside the browser.

Source: *Mindset for IELTS Level 3 Student’s Book*, Cambridge University Press and UCLES, 2018, from the PDF supplied for this task. Original textbook copyright and acknowledgements belong to their respective owners.
