# Asset manifest và player

## File paths

52 manifest entries tương ứng đúng 52 MP3 từ ZIP. File names `audio/unit1/track-09.mp3` … `audio/unit5/track-44.mp3`; 25 track ngoài phạm vi vào `audio/additional/track-45.mp3` … . ZIP gốc chỉ có một thư mục, không chia Unit; chỉ Unit 1–5 có grouping được xác minh, additional unit=null. `originalName` giữ nguyên để đối chiếu. Không đổi số gốc thành 1.1.

Manifest chứa `exerciseId` chính để tương thích shape yêu cầu và `exerciseIds` cho tất cả liên kết; `audioTracks` array trên Ex hỗ trợ nhiều track. JSON không hard-code BASE_URL. Player URL: `${import.meta.env.BASE_URL}${entry.file}`; manifest file không bắt đầu bằng slash. Validate no `..`, slash đầu hay absolute URL. Các yêu cầu thiếu audio nằm audio-requirements; không tạo manifest file tưởng có. Mỗi bài nghe vẫn tồn tại với missing badge và disabled play.

Giai đoạn 3 copy audio nguyên byte sang public/ và kiểm SHA-256 sau copy; set fileStatus=integrated và availableInApp=true. Manifest phải qua file-existence và metadata/hash validator. Total 54.970.816 bytes, max 3.124.672 bytes: không nén lại, không LFS. Repo không đưa PDF/ZIP gốc vào git. Các asset vượt 100MB sẽ chặn push; >50MB cảnh báo kiểm tra. Không có file như vậy hiện tại.

## Player ổn định

AudioProvider đặt trên HashRouter route outlet, một `<audio>` duy nhất không key theo language/route. Track state gồm id, currentTime, playbackRate, playing, repeatA/B, error và examAttempt. controls: play/pause, ±5s, 0.75/1/1.25, A/B và clear. set B bắt buộc B>A và B≤duration; loop seek về A khi currentTime≥B. Safari/iOS user gesture first play; xử lý play() rejected với error locale, không hứa autoplay.

Shortcuts khi player có focus: Space=play/pause, ←/→=±5s, A/B=set markers. Không chặn khi người dùng gõ trong input/textarea, không gán shortcut toàn trang cho ký tự A/B. Labels screen reader và aria-valuetext time. Sticky bottom có safe-area-inset-bottom, content padding theo chiều cao để không che nút nộp.

## Script và cues

Original English từ Listening Scripts; translator mỗi segment với verified status. Đưa raw source vào sanitizer/plain text, không HTML tùy ý. Show/hide/translate không làm restart player. Static answer highlight dựa trên question evidence segment IDs, không keyword match mù. Sync highlight chỉ bật khi cueStatus=verified; không có cues thì hiển thị “Chưa có dữ liệu…” và không giả highlight câu đang nói. Translation missing có marker ngay dưới đoạn.

Descript chỉ dùng nếu cần hỗ trợ định vị/cues sau khi được đưa track vào dự án phù hợp; output ASR không thay thế Audioscript Cambridge. Không biên tập/cắt nội dung gốc.

## One-listen practice

Chế độ một lần là quy tắc luyện tập phía client, không chống gian lận tuyệt đối. Gắn attemptId, persist started/completed; disable seek/replay/rate/loop trong attempt, timer dùng deadline timestamp. Refresh/resume giữ trạng thái không cấp lại lượt nghe; back/next language không reset. File missing không cho bắt đầu bài thi yêu cầu track đó. Ended đánh dấu played=true; submit không phát lại tự động. Mất mạng/file-load failure cho retry kỹ thuật có thông báo, không tự tính là nghe hoàn tất. Đồng hồ Listening không tự suy ra từ duration: test config xác định thời lượng/transfer time theo bài luyện.
