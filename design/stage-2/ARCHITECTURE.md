# Kiến trúc triển khai sau khi duyệt

## Stack và cấu trúc

React + Vite + TypeScript + Tailwind CSS; i18next/react-i18next; React Router HashRouter; Fuse.js; IndexedDB cho recordings, localStorage cho settings/compact drafts/progress (bọc lỗi quota). `vite.config.ts` base='/Mindset-For-IELTS/'. Không backend, không đăng nhập, không thu thông tin người học lên server.

```
src/
  app/ AppShell.tsx routes.tsx providers/
  components/ LanguageSwitch SearchDialog Sidebar Breadcrumb SourceBadge
  features/ exercises/ audio/ writing/ speaking/ vocabulary/ mock/ progress/
  data/ units/ passages/ audioscripts/ exam-tips/ vocabulary/
        exercise-index.json audio-manifest.json audio-requirements.json
  locales/ en.json vi.json
  lib/ grading.ts source-validation.ts normalize-search.ts storage.ts timers.ts
  styles/
public/audio/ unit1/... unit5/... additional/...
scripts/ validate-data.mjs validate-audio.mjs
.github/workflows/deploy.yml
```

Provider order: Settings → I18n → Progress/Drafts → Persistent Audio → Router. MediaRecorder không đi qua locale-dependent rendering; trạng thái microphone session nằm trong speaking service. UI pure components nhận data/status và dispatch action; grading không đọc DOM hay display translation.

Hash paths: `#/`, `#/units/:unit`, `#/exercises/:id`, `#/audio`, `#/exam-skills`, `#/writing`, `#/speaking`, `#/vocabulary`, `#/mock`, `#/progress`, `#/settings`. Deep links tới track có `?track=09`, tới source/tip dùng stable IDs. Trước/Sau theo lesson.exerciseIds, không sắp chuỗi từ điển sai Ex 2/10. Accordion sidebar Unit→section→Ex, mobile focus trap + Esc.

## Quan hệ state

- Draft answers keyed exerciseId, ngay mỗi thay đổi debounced persist. Submission snapshot append attempt; reset chỉ draft nếu xác nhận, không xóa history/bookmark/notes.
- Resume gồm exerciseId, lastVisitedAt, readingScroll/audioTrack/time nếu phù hợp; audio progress không ngụ ý completed Ex.
- Writing word count từ draft plain text; min150/250 là chỉ báo, không tự band. Deadline dùng Date.now, timer chịu hidden tab/refresh.
- Speaking recording start chỉ sau user gesture và microphone permission; tracks stop trên finish; Blob cleanup revokeObjectURL. URL web HTTPS/localhost required.
- Progress import validate schema, file-size budget 10MB, appId/version, orphan IDs báo/cách bỏ qua; chọn merge/replace, export backup trước replace, không prototype pollution. Stored keys namespaced `mindset3:v1:*`.
- Mock test immutable config/source exercise IDs, saved deadline, submit idempotent, expiry auto-submit đúng một lần. English exam prompt có lang=en, lời giải theo solution preference sau submit. Final Reading chấm tự động chỉ verified objective; Writing/Speaking self review. Thi thử không phải đề trường đã xác nhận.

## Phân chia thực hiện

Giai đoạn 3: framework/shell/i18n + toàn bộ 52 audio assets/manifest + Unit 1 đầy đủ, commit/push. Giai đoạn 4: Unit 2,3,4,5 từng commit/push sau khi báo cáo đủ source coverage và thiếu sót. Giai đoạn 5: Writing/Speaking/vocab/mock/progress toàn bộ, browser/mobile/a11y, deploy Actions/Pages. Không gọi instant builder auto-publish để bỏ qua các điểm duyệt.
