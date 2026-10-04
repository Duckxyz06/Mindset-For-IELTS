# Verification và acceptance

## Giai đoạn 2 (thực hiện hiện tại)

1. Parse tất cả JSON; en/vi key equality, nonempty, matching interpolation tokens.
2. 5 units / 20 lessons / 289 unique Ex IDs, mỗi Ex liên kết lesson thật, mỗi lesson đúng Unit; số Ex liên tục đúng ledger giai đoạn1.
3. 52 unique track/file paths; verify metadata/hash đối với file giải nén gốc. Exercise references hai chiều; 43 yêu cầu =27available+16missing; 25 additional không tự gán Unit/bài.
4. Validate manifest theo JSON Schema Draft 2020-12; check tất cả schema definitions hợp lệ. Full exercise samples chưa nhập, không tuyên bố chúng validated/completed.
5. Wireframe: desktop 1440/mobile390; cả VI,EN,both và sáng/tối không horizontal overflow; search/filter; menu nhỏ; keyboard shortcuts; giữ text khi đổi locale; label controls đầy đủ. Không test grading/audio playback không có ở preview.

## Giai đoạn 3–4 (content và core runtime)

- Mỗi Ex/Question đáp án so trực tiếp Answer Key với source page; MCQ distractor explanations đối chiếu passage. Phân biệt students-own/sample/suggested. Không giữ câu needs_checking trong điểm số.
- Mỗi Unit ledger đủ Ex và mọi hộp TIP/Focus/Skills, kể cả grammar/vocabulary tích hợp. OCR errors check page images.
- i18n switches mid-exercise/mid-audio giữ draft/time/player; html lang đúng. Separate solution setting hoạt động; missing translation có marker. Search “suc khoe” tìm “Sức khỏe”; Track9/09; evidence highlighting index không lệch do Unicode.
- Grading tests meaningful: accepted alternatives, word limit, TFNG/YN​NG, multiple answer order vs matching order, punctuation, source unverified/open exclusions. Không test chỉ mirror implementation.
- 52 audio file existence/hash check, HTTP HEAD/range qua Pages base, thực play ở trình duyệt mỗi file; validate seeking/rate/A-B/error/missing16/one-listen resume. iOS interaction limitation báo thực tế nếu không có thiết bị kiểm.
- Build vite + strict typecheck/data validator; status không có PDF/ZIP/token/env hoặc >100MB asset trước push. Source content import stats rõ từng Unit.

## Giai đoạn 5

- Browser desktop/mobile cả ba locale, light/dark, tab/focus/Esc/accessibility, readable long passages.
- Writing count150/250, 20/40 timers background/refresh, draft persistence; models explicit source and bilingual criteria; no invented bands.
- Speaking permission grant/deny/unsupported, recording/playback/cleanup, 1+2 minute flow and 5criteria1–4 rubric; actual course assigned cards confirmed or marked.
- Progress import/export roundtrip, invalid/version mismatch/quota, merge vsreplace, preserved history, recordings excluded with notice.
- Final90minute Reading+Task2 expiry/save/submit exactly once; progress test audio+Part1 two topics/fourquestions source verified. Missing-source mock blocked.
- Actions build Pages base + HashRouter refresh/deep link/audio successful; link web only after deploy verified. Không hứa hosted preview trước khi có deploy.
