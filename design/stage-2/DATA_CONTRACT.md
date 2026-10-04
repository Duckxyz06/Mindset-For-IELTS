# Hợp đồng dữ liệu

## ID và provenance

`unit-1`; `u1-reading`; `u1-reading-ex-18`; question `u1-reading-ex-18-q-1`; `track-09`. ID ổn định không chứa bản dịch. Unit, section và exerciseNo là số/tên gốc; sourceLessonNumber=null vì sách không đánh số lesson thập phân. SchemaVersion=1 dùng cho migration.

Nguồn: document ID, printedPages, pdfPages, sourceSection, exerciseNo, locator và verificationStatus. PDF sách hiện tại có độ lệch +2 trang; phải lưu cả hai thay vì hard-code lệch trong renderer. Locator ghi paragraph A/heading ii/box/exercise question, tránh tự tạo line number khi sách không có dòng đánh số. App có thể đánh số dòng hiển thị riêng nhưng phải ghi đó là dòng của bản số hóa.

## Dữ liệu chỉ mục và dữ liệu hoàn chỉnh

exercise-index là scaffold kiểm kê; questions chưa có, questionTypes=[] và difficulty=null là chưa phân loại, không phải “không có bài”. Dữ liệu hoàn chỉnh từng Unit nằm tại `src/data/units/unit-1.json` …; passage chung ở content collection để nhiều Ex tham chiếu cùng passageId, không sao chép một bài đọc nhiều lần. Exercise schema yêu cầu instructions_en/vi và questions khi import. Unit metadata title được dịch; passage, prompt, questions và modelAnswer tiếng Anh giữ nguyên.

`skill` là kỹ năng chính. `skills` gồm nhãn phụ grammar/vocabulary để lọc chéo. Chỉ có một ID tiến độ cho một Ex dù nhiều nhãn. questionType dùng code ổn định (`matching_headings`, `tfng`, `ynng`, `sentence_completion`, `summary_completion`, `note_completion`, `table_completion`, `flow_chart_completion`, `short_answer`, `multiple_choice`, `multiple_select`, `matching_information`, `matching_features`, `map_labelling`, `diagram_labelling`, `writing_task1`, `writing_task2`, `speaking_part1/2/3`, `language_analysis`, `discussion`). Độ khó do giáo viên đánh giá, nguồn `teacher_assigned`, không ngụ ý Cambridge công bố; để null khi chưa đánh giá.

## Đáp án và lời giải

Answer gồm kind (objective/open/sample/suggested), value, acceptedAnswers, status và source. verified bắt buộc source verified. needs_checking bắt buộc value=null và acceptedAnswers=[], vô hiệu chấm câu đó. not_applicable dùng câu mở; câu có mẫu vẫn hiển thị mẫu và tự review, không cố khớp văn bản.

Normalization là từng câu: trim, collapseWhitespace, caseSensitive, ignorePunctuation, wordLimit, allowNumber. Không strip toàn bộ dấu câu ở email/code/postcode; không bỏ word limit; không coi synonym tự nghĩ là accepted answer nếu Key không cho. Một đáp án nhiều lựa chọn so như set khi đề không yêu cầu thứ tự; matching/ordering giữ mapping/order theo đề. Hyphenated word và số được xử lý theo quy tắc nhiệm vụ sau khi đối chiếu hướng dẫn IELTS chính thức ở bước implementation. Test grading bắt buộc có case spelling/word limit/alternatives hợp lệ và câu chưa xác minh.

Mỗi question có explanation_en/vi, tips_en/vi, evidence, keywords, options why_wrong_en/vi, relatedTipIds, vocabularyIds, grammarIds. Field thiếu phải là `⚠ Needs checking` / `⚠ Cần kiểm tra` kèm status needs_checking, không trống và không dịch ẩu. Nội dung thực chưa import thì nằm ngoài published content collection, không làm 289 record trống như đã hoàn chỉnh.

Evidence quote giữ original English, gắn paragraphId hoặc segmentId và source locator. Không tự phân bổ timestamps. Bài trắc nghiệm phải có lý do đối với từng distractor nếu đã xác minh; thiếu vẫn hiện marker. Teacher strategy là nội dung mới, ghi nguồn rõ và không gán vào original_en của sách.

## Các collection khác

- exam tips: mỗi hộp ID riêng theo unit/section/page/kind; original_en, translation_vi, source; tips_en/vi cho diễn giải giáo viên. Coverage ledger liệt kê mọi box trên trang và trạng thái, gồm các box không có nhãn “TIP”.
- audioscripts: segments có speaker/text_en/translation_vi; startSec/endSec có thể null, cueStatus not_created. Chỉ bật sync khi cues kiểm chứng và start<end≤duration; answerQuestionIds cho highlight câu chứa đáp án đã xác minh, không suy ra chỉ bằng keyword.
- writing: sourceType textbook/teacher_authored; task1/2, modelAnswer English, 4 criteria analysis EN/VI, outline và language items. bandClaim=null; không tự tuyên bố band của mẫu Cambridge hoặc bài bổ sung.
- speaking: part1/2/3, prompt/bullets English, sample answer và translation, assignedForCourseVideo=null khi chưa xác nhận, exact audio links. Không tự tạo card cho Unit 2 rồi gắn nhãn sách.
- vocabulary: word/POS/IPA/meaning EN/VI/example/translation/source và verification. IPA chưa xác minh hiển thị marker. TTS trình duyệt chỉ là hỗ trợ phát âm, không gọi là audio của sách.
- progress: export v1 appId cố định; attempt answer maps, contentRevision, draft, bookmark, notes, resume và settings. Bản ghi micro lưu Blob trong IndexedDB, không base64 trong localStorage/JSON.

## Kiểm tra trước khi publish mỗi Unit

Không orphan reference; mỗi verified answer có provenance; mọi lời giải có cặp EN/VI; số Ex giữ nguyên; ledger đúng số Ex và box; audio required chỉ link manifest thực có hoặc missing state. Nội dung needs_checking luôn được liệt kê trong báo cáo Unit. Sửa đáp án sau publish tăng contentRevision; attempt cũ giữ revision để điểm lịch sử không bị đổi ngầm.
