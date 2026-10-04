# i18next và ba chế độ ngôn ngữ

## Runtime

Dependencies: i18next + react-i18next. `init({ resources: {en:{translation:en},vi:{translation:vi}}, lng: browserLang.startsWith('vi')?'vi':'en', fallbackLng:'en', keySeparator:false, interpolation:{escapeValue:false} })`. Sau này `src/locales/en.json` và `vi.json` chính là locale trong thiết kế. UI mode: vi/en/both; both không phải một locale dịch thứ ba.

UI wrapper `t(key, values)` dùng useTranslation; vi/en trả bản tương ứng; both trả `VI / EN`. Nội dung explanation sử dụng solutionLanguage independent: follow resolves UI mode; both hiển thị EN trước VI sau (hai cột ≥1000px, xếp dọc mobile). Nội dung học có field EN/VI, không trộn vào UI json. Checkbox/menu/state/errors/tooltips/aria-label/placeholder đều gọi t(key). Tên Unit, source label, word và original IELTS text là content, không phải UI hard-code.

250 key hiện có đủ 2 file, không key rỗng. Danh sách trong key-list.json. Phát sinh nhãn mới phải thêm cả EN/VI trong cùng commit. Build validator kiểm tra parity, placeholders `{{count}}` đồng nhất, key tồn tại, không field dịch trống. UI locale fallback English chỉ để chống lỗi runtime; audit vẫn báo thiếu VI, không im lặng xem EN là bản dịch hoàn tất.

Nếu sau này cần plural: bổ sung `_one`, `_other` của EN và locale-specific plural keys cùng test. Preview hiện dùng English phrasing tránh singular/plural ở count có thể bằng 1 (“Track {{number}}”, “{{count}} exercises” là nhãn tổng luôn >1), nhưng ứng dụng phải xử lý riêng count=1.

## State không bị mất

LanguageProvider và SettingsStore nằm ngoài route pages. Draft store tách khỏi rendered text. Không key Component theo locale; không unmount AudioProvider khi changeLanguage; audio element duy nhất ở AppShell. Change UI language rerender text, không reset timers/answers/MediaRecorder. Controlled fields lấy từ draft store, aria-live chỉ announce sau action. `html lang=vi/en`; both chọn lang=vi cho UI, mỗi đoạn EN gắn lang=en và VI gắn lang=vi. Passage luôn lang=en.

Default browser language chỉ áp dụng lần đầu; saved settings thắng. Alt+L cycle vi→en→both→vi; bỏ qua khi shortcut xung đột hệ thống, input vẫn giữ nội dung. Ctrl+K hoặc Cmd+K mở search. Bấm Esc đóng overlay và trả focus. UI cả mobile giữ nút ngôn ngữ trong header.

## Tìm kiếm và định dạng

Normalize NFD remove combining marks, replace đ/Đ with d/D, lowercase, collapse whitespace. Index cả raw và normalized EN/VI của instructions, passage, answer (chỉ verified), explanation, tips, audioscript, vocabulary, unit and track. Track parser nhận “9”, “09”, “Track 09”; không tạo Track 1.1. Fuse.js tìm candidate; highlight phải map về chuỗi gốc theo grapheme boundaries, tránh lệch index vì bỏ dấu. Không render raw result bằng dangerouslySetInnerHTML.

Intl.DateTimeFormat/NumberFormat vi-VN hoặc en-GB; both dùng vi-VN cho UI. Course timer mm:ss là format độc lập. Settings có separate UI/solution selector. Dictionary terms IELTS vẫn giữ English gốc và giải nghĩa VI khi xuất hiện đầu; state “term seen” nằm theo session, không sửa source text.
