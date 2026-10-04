# Giai đoạn 2 — Thiết kế IELTS Mindset 3 – Study Hub

Ngày: 05/10/2026. Giai đoạn này tạo bản thiết kế và dữ liệu kiểm kê có cấu trúc; chưa dựng React app, chưa nhập Unit 1 hoàn chỉnh, chưa tích hợp binary audio vào app.

## Kết quả để duyệt

- `prototype/wireframe.html`: bản xem trước tương tác, mở trực tiếp trên máy, không cần server/network; menu trang, bộ lọc Unit/kỹ năng, chọn bài, thư viện audio, trang viết/nói/thi thử/tiến độ/cài đặt, ba chế độ ngôn ngữ, sáng/tối, cỡ chữ, Ctrl+K/Alt+L.
- `data/units.json`: 5 Unit, đúng chủ đề sách.
- `data/lessons.json`: 20 phần kỹ năng. Không gán số Lesson tự tạo là số gốc của Cambridge.
- `data/exercise-index.json`: 289 mã Ex, nguyên số thứ tự theo phần. Đây là metadata; `contentStatus=not_imported`, không phải 289 bài tập đã có đề/đáp án.
- `data/audio-manifest.json`: 52 asset thực có, tên gốc, SHA-256, duration/bytes, tên file chuẩn hóa, liên kết bài đã biết. `availableInApp=false`, `fileStatus=staged_original` trước khi copy binary ở giai đoạn 3.
- `data/audio-requirements.json`: 43 track được tham chiếu ở Unit 1–5, trong đó 27 có và 16 thiếu.
- `locales/en.json` + `vi.json`: 250 key UI mỗi ngôn ngữ, gồm nhãn, lỗi, trạng thái rỗng, tooltip, accessiblity labels và thông báo thiếu nguồn.
- 8 JSON Schema: Exercise, Audioscript, audio manifest, Exam Tip, Writing model, Speaking card, Vocabulary, progress export.
- `DATA_CONTRACT.md`, `I18N_SPEC.md`, `AUDIO_SPEC.md`, `ARCHITECTURE.md`, `QA_PLAN.md`: hợp đồng triển khai cho giai đoạn 3–5.

## Bố cục

| Trang | Công việc chính | Thành phần |
|---|---|---|
| Dashboard | Chọn nội dung và tiếp tục học | Hero, 289 Ex đã kiểm kê / 52 audio hiện có / 5 Unit, cards Unit, resume, công cụ luyện, đánh giá 30/20/50 |
| Catalog | Tìm đúng Ex | Filter Unit/kỹ năng/dạng/độ khó/trạng thái, danh sách, nguồn trang và trạng thái xác minh |
| Exercise | Làm bài và đọc lời giải | Breadcrumb, nguồn và đề English bên trái, câu hỏi bên phải, kiểm tra/xem/làm lại, lời giải EN/VI, bookmark/notes, previous/next |
| Audio | Nghe và tìm track | Tìm track, filter Unit/additional, dùng ở bài nào, player cố định, script/dịch, trạng thái thiếu |
| Exam Skills | Tra mẹo theo dạng | Các hộp gốc có source locator; chiến lược giáo viên viết có nhãn riêng |
| Writing | Viết có giới hạn thời gian | Task 1/2, timer, đếm từ, draft, model, 4 tiêu chí và outline |
| Speaking | Luyện nói và tự đánh giá | Part 1/2/3, chuẩn bị 1 phút + nói 2 phút, recording/playback, course rubric 1–4 |
| Vocabulary | Ôn từ hai chiều | Unit, IPA, nghĩa EN/VI, ví dụ, hướng flashcard, phát âm/quiz |
| Mock | Làm bài theo đề cương | Final 90 phút Reading+Task 2, progress Listening+Part 1; prompt/hướng dẫn English |
| Progress | Xem lịch sử và sao lưu | Attempts, sai/đánh dấu, biểu đồ kỹ năng, import/export JSON |
| Settings | Tùy chỉnh đọc/học | UI language, solution language riêng, theme, cỡ chữ, shortcuts |

Desktop: sidebar 236px, header luôn truy cập được, main max 1440px; bài đọc tối đa 68 ký tự/dòng. Mobile: menu overlay, header language control không ẩn, bài tập xếp dọc, player sticky bottom, nút thao tác wrap và touch target ít nhất 44px. Bản preview dùng số liệu kiểm kê thật và tiến độ 0; không hiển thị thành tích giả.

## Quyết định nội dung

1. Giữ phần Writing Unit 4 theo sách (Task 2); thêm “ôn theo đề cương” cho Task 1. Nội dung process/table bổ sung chỉ được gắn nhãn teacher-authored, không mang số Ex gốc.
2. Grammar/Vocabulary dùng nhãn kỹ năng phụ của Ex và mục học riêng qua liên kết; không nhân đôi Ex để làm tăng tiến độ.
3. Bài thảo luận/sample/suggested answers dùng tự đánh giá hoặc reference model; không chấm máy bằng một chuỗi duy nhất.
4. Chưa có đáp án/evidence được xác minh: answer.value=null, status=needs_checking; không dùng chuỗi cảnh báo như một đáp án cần nhập.
5. Tiến độ completion và accuracy khác nhau: completion đo Ex đã nộp; accuracy chỉ dùng câu khách quan đã xác minh, loại câu chưa rõ và câu mở khỏi mẫu số.
6. Số từ vựng chưa có dữ liệu nhập: hiện “Chưa nhập nội dung”, không tự đặt số.
7. Course rubric 5 tiêu chí × 1–4 được tách khỏi IELTS Speaking band criteria. Không coi tổng rubric là band IELTS.

## Các mục ⚠ Cần kiểm tra

- 16 MP3 thiếu: 02–08, 10–13, 22–24, 29–30. Không có source audio để tự bổ sung.
- Track 01: chưa xác minh định danh/tham chiếu; ZIP không có.
- 25 track ngoài phạm vi Unit 1–5: giữ trong thư viện thêm, unit=null; chưa gán Exercise.
- 52 audio chưa nghe đối chiếu từng track với Audioscript. Metadata/giải mã đã kiểm tra ở giai đoạn 1; contentIdentityStatus còn needs_checking.
- Exact timestamps/cues chưa có, nên không giả lập đồng bộ câu theo thời gian.
- Chưa xác nhận 5 Speaking card để nộp video; chưa gán mặc định một card/Unit.
- Chưa kiểm kê đầy đủ từng hộp TIP nhỏ; 20 khối Exam Skills chính đã xác định ở giai đoạn 1.
- Online Grammar/Vocabulary modules không được cung cấp.
- Đề/đáp án/dịch nội dung học chưa nhập ở giai đoạn này. 250 key UI đã có đủ EN/VI, nhưng đó không phải bản dịch toàn bộ sách.

## Giới hạn bản preview

Preview chỉ minh họa màn hình và luồng tương tác. Nó không phát audio, chấm bài, ghi âm micro, import/export tiến độ thật hay chạy thi thử. Những nút này được vô hiệu hóa/ghi rõ planned. Native JavaScript của preview được dùng để xem thiết kế offline; React + i18next là công nghệ triển khai app ở giai đoạn 3. Đổi ngôn ngữ trong preview giữ nội dung textarea/input.

## Git và bước tiếp theo

Đẩy thiết kế vào `design/stage-2/`, giữ nguyên lịch sử và báo cáo giai đoạn 1. Các file locale/manifest sẽ được đưa vào `src/` khi dựng app, không tạo một app nửa chừng trong giai đoạn thiết kế. Chưa có Vite build để chạy; kiểm tra của giai đoạn này là JSON Schema, liên kết dữ liệu, key locale và browser layout.

Sau khi duyệt giai đoạn 2 mới sang giai đoạn 3: dựng React/Vite, player persistent, i18next và nhập/kiểm chứng Unit 1 theo từng Ex. Tài liệu gốc không được đưa vào git.

## Kiểm tra đã thực hiện

- JSON/schema: 17 JSON cấu trúc chính parse được; 8 schema hợp lệ; manifest validated; 250 key mỗi locale không thiếu/rỗng và placeholders đồng nhất. 52 SHA-256 khớp MP3 gốc.
- Chromium headless: 132 layout checks = 11 màn hình × 3 ngôn ngữ × 2 theme × 2 viewport (1440px và390px); không có overflow ngang hoặc pageerror.
- Kiểm tra thao tác: Unit5 filter trả54 Ex; audio search trả đúng Track09; tìm “suc khoe” có kết quả Sức khỏe; draft và answer giữ khi đổi locale; solution language chọn độc lập.
- Thao tác audio/chấm bài/ghi âm/deploy thật chưa được test vì chưa triển khai. Đây là viewport simulation, chưa phải kiểm chứng thiết bị iOS/Android thật.
- Kết quả máy đọc được trong validation/. Ảnh chụp preview nằm trong gói ZIP bàn giao.
