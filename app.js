import { STORAGE_KEY, markAnswer, parseRoute, countWords, readState } from './core.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let storage;
try { storage = window.localStorage; } catch { storage = { getItem: () => null, setItem: () => { throw Error('Storage unavailable'); } }; }
const state = readState(storage);
let course, lesson, pageIndex = 0, exercise, requestId = 0, storageWarning = false;
const cache = new Map();
const labels = {
  vi: { goals:'Mục tiêu bài học', method:'Cách học', content:'Nội dung trọn vẹn', original:'Trang sách & bài tập', originalSub:'Chọn trang để đọc câu hỏi và làm bài ở ô bên cạnh.', zoom:'Phóng to', answerKey:'Đến Answer Key ↓', notes:'Bài làm của bạn', noteHint:'Câu hỏi đầy đủ nằm trên trang sách. Chọn số bài trước khi nhập câu trả lời.', exercise:'Bài tập', page:'Trang', question:'Câu', response:'Nhập câu trả lời hoặc ghi chú…', saved:'Tự lưu trên thiết bị', notSaved:'Không thể lưu trên thiết bị', words:'từ', check:'Kiểm tra', showKey:'Đối chiếu đáp án ↓', reviewed:'Tôi đã làm và đối chiếu bài này', reviewHint:'Bài thảo luận, Writing và Speaking được tự đối chiếu với đáp án mẫu.', previousPage:'← Trang trước', nextPage:'Trang tiếp →', selectable:'Văn bản có thể chọn / sao chép', extracted:'Bản chữ trích từ PDF; dùng trang sách để kiểm tra bố cục và ký tự.', audio:'Audio & Listening Scripts', audioSub:'Các track được sắp theo số in trong sách.', missing:'Chưa có file nghe cho track này. Bạn có thể đọc Listening Script bên dưới.', script:'Mở Listening Scripts', key:'Answer Key · Đáp án phía sau', keySub:'Đáp án và bài mẫu gốc cho đúng kỹ năng đang học. Bài mở có thể có nhiều cách trả lời.', openKey:'Mở đáp án & bài mẫu', source:'Nguồn', audioReady:'File nghe có sẵn', gradeHint:'Chấm các câu đã nhập; chấp nhận các cách trả lời đã có trong đáp án.', openHint:'Ghi câu trả lời theo thứ tự các câu trong sách, hoặc viết bài hoàn chỉnh.', correct:'Đúng', incorrect:'Cần xem lại', expected:'Đáp án', unanswered:'Chưa trả lời', checked:'Đã kiểm tra', export:'Tải bài làm', nextLesson:'Kỹ năng tiếp theo →', prevLesson:'← Kỹ năng trước', totalPages:'trang bài học', exercises:'bài tập', complete:'đã đối chiếu', footer:'Nội dung học từ tài liệu được cung cấp. Bài làm được lưu riêng trên trình duyệt của bạn.', failure:'Không mở được bài học. Kiểm tra kết nối và thử tải lại trang.', retry:'Thử lại', load:'Đang mở bài học…', progress:'Tiến độ', skills:'kỹ năng', openOriginal:'Phóng to trang sách', refPiece:'Đáp án gốc', missingCount:'track thiếu file', objective:'Câu có đáp án xác định', open:'Bài mở / thảo luận', exportDone:'Đã tải bài làm của bài học này.', copied:'Bài làm được lưu tự động.', methodText:'Đọc mục tiêu → đọc trang sách → làm từng bài → đối chiếu Answer Key ở cuối.', allContent:'Giữ nguyên bài đọc, hình ảnh, bảng, biểu đồ, TIP và EXAM SKILLS của sách.', reload:'Tải lại', pageNotMapped:'Chọn trang có số bài tương ứng trên thanh trang.' },
  en: { goals:'Learning objectives', method:'How to study', content:'Complete source content', original:'Textbook & exercises', originalSub:'Choose a page, read the task, and enter your response beside it.', zoom:'Enlarge', answerKey:'Go to Answer Key ↓', notes:'Your answers', noteHint:'The complete task is on the textbook page. Choose an exercise before answering.', exercise:'Exercise', page:'Page', question:'Question', response:'Enter your answers or notes…', saved:'Saved on this device', notSaved:'Unable to save on this device', words:'words', check:'Check answers', showKey:'Compare with key ↓', reviewed:'I have completed and reviewed this exercise', reviewHint:'Discussion, Writing and Speaking tasks are self-reviewed against the sample answers.', previousPage:'← Previous page', nextPage:'Next page →', selectable:'Selectable source text', extracted:'Text extracted from the PDF; refer to the page image for layout and characters.', audio:'Audio & Listening Scripts', audioSub:'Tracks follow the numbers printed in the book.', missing:'No audio file is available for this track. You can read the Listening Script below.', script:'Open Listening Scripts', key:'Answer Key · At the end', keySub:'Original answers and model responses for the selected skill. Open tasks may have several valid answers.', openKey:'Open answers & model responses', source:'Source', audioReady:'Audio available', gradeHint:'Checks completed fields against transcribed accepted answers.', openHint:'Enter numbered responses from the book, or write your complete response.', correct:'Correct', incorrect:'Review', expected:'Answer', unanswered:'Not answered', checked:'Checked', export:'Download answers', nextLesson:'Next skill →', prevLesson:'← Previous skill', totalPages:'lesson pages', exercises:'exercises', complete:'reviewed', footer:'Learning content from the supplied document. Your answers are stored privately in your browser.', failure:'Unable to open this lesson. Check your connection and reload.', retry:'Retry', load:'Opening lesson…', progress:'Progress', skills:'skills', openOriginal:'Enlarge textbook page', refPiece:'Original answer key', missingCount:'missing audio tracks', objective:'Questions with fixed answers', open:'Open response / discussion', exportDone:'Downloaded your answers for this lesson.', copied:'Your work is saved automatically.', methodText:'Read the objectives → read the book → complete each exercise → compare with the Answer Key at the end.', allContent:'Original passages, images, tables, charts, TIP boxes and EXAM SKILLS are preserved.', reload:'Reload', pageNotMapped:'Choose the textbook page with the corresponding exercise number.' }
};
const t = key => labels[state.lang][key] || key;
const languageText = pair => typeof pair === 'object' ? pair[state.lang] : pair;

function save() {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { if (!storageWarning) { storageWarning = true; toast(t('notSaved')); } return false; }
}
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3400); }
function completion(id) { return lesson?.id === id ? lesson.exercises.filter(e => state.reviewed[e.id]).length : Object.keys(state.reviewed).filter(k => k.startsWith(id + '-ex-') && state.reviewed[k]).length; }
function renderNavigation() {
  document.documentElement.lang = state.lang;
  const unit = course.units.find(u => u.id === lesson.unit);
  document.documentElement.style.setProperty('--accent', unit.color);
  document.documentElement.style.setProperty('--tint', unit.tint);
  $('#units').innerHTML = course.units.map(u => `<button type="button" class="unit-button" data-route="u${u.id}-${lesson.skill}" aria-current="${u.id === lesson.unit}" style="--unit-color:${u.color};--unit-tint:${u.tint}"><span class="unit-no">${String(u.id).padStart(2,'0')}</span><span><strong>Unit ${String(u.id).padStart(2,'0')}</strong><small>${esc(languageText(u.name))}</small></span></button>`).join('');
  $('#skills').innerHTML = course.skills.map(s => `<button type="button" class="skill-button" data-route="u${lesson.unit}-${s.id}" aria-current="${s.id === lesson.skill}" style="--skill-color:${s.color}"><span>${s.symbol}</span>${s.id[0].toUpperCase()+s.id.slice(1)}<small>${esc(languageText(s.name))}</small></button>`).join('');
  const completed = course.lessons.filter(l => l.unit === unit.id).reduce((n,l) => n+completion(l.id),0);
  const total = course.lessons.filter(l => l.unit === unit.id).reduce((n,l) => n+l.count,0);
  $('#unit-heading').innerHTML = `<div><div class="eyebrow">Unit ${String(unit.id).padStart(2,'0')} · Level 3</div><h1>${esc(unit.name.en)}</h1><p>${esc(unit.name.vi)} · ${t('page')} ${unit.pages[0]}–${unit.pages[1]}</p></div><div class="unit-meta"><span class="pill">4 ${t('skills')}</span><span class="pill">${total} ${t('exercises')}</span><span class="pill" id="progress">${completed}/${total} ${t('complete')}</span></div>`;
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  $('#footer-note').textContent = t('footer');
  document.title = `Unit ${unit.id} · ${lesson.skill[0].toUpperCase()+lesson.skill.slice(1)} | Mindset for IELTS`;
}
function cropHtml(piece, name, index) {
  const [x,y,w,h] = piece.rect;
  return `<button type="button" class="crop" data-crop="${name}:${index}" aria-label="${esc(t('zoom'))} — ${t('page')} ${piece.page}" style="aspect-ratio:${w*piece.width}/${h*piece.height}"><img src="assets/pages/page-${String(piece.page).padStart(3,'0')}.webp" loading="lazy" alt="${esc(t('refPiece'))}, ${t('page')} ${piece.page}" style="width:${100/w}%;left:${-100*x/w}%;top:${-100*y/h}%"></button>`;
}
function referenceHtml(pieces, name) {
  return `<div class="reference-pieces">${pieces.map((p,i) => `<div><p class="reference-label">${t('page')} ${p.page} · ${i+1}/${pieces.length}</p>${cropHtml(p,name,i)}</div>`).join('')}</div>`;
}
function renderLesson() {
  const chosen = state.selected[lesson.id];
  exercise = lesson.exercises.find(e => e.id === chosen) || lesson.exercises[0];
  pageIndex = Math.max(0, lesson.pages.findIndex(p => p.number === state.page[lesson.id]));
  renderNavigation();
  $('#lesson').innerHTML = `<div class="overview"><article class="info-card"><h2>◎ ${t('goals')}</h2><ul>${lesson.goals[state.lang].map(g => `<li>${esc(g)}</li>`).join('')}</ul></article><article class="info-card"><h2>✎ ${t('method')}</h2><p>${t('methodText')}</p></article><article class="info-card"><h2>▤ ${t('content')}</h2><p>${t('allContent')}</p><p style="margin-top:7px"><strong>${lesson.pages.length}</strong> ${t('totalPages')} · <strong>${lesson.exercises.length}</strong> ${t('exercises')}</p></article></div>
    <div class="section-top"><div><h2 class="section-title"><span class="icon">▤</span>${t('original')}</h2><p>${t('originalSub')}</p></div><button type="button" class="button" data-key>${t('answerKey')}</button></div>
    <div class="reader-tools"><div class="page-nav" id="page-nav"></div><div class="reader-action"><button type="button" class="text-button" data-zoom-page>↗ ${t('zoom')}</button></div></div>
    <div class="workbench"><figure class="book-page"><button type="button" class="page-frame" data-zoom-page aria-label="${t('openOriginal')}"><img id="source-image" alt="" decoding="async" fetchpriority="high"></button><figcaption><span id="source-caption"></span><span>Cambridge · 2018</span></figcaption></figure><aside class="notebook"><h3>✎ ${t('notes')}</h3><p class="hint">${t('noteHint')}</p><label class="sr-only" for="exercise-select">${t('exercise')}</label><select class="exercise-select" id="exercise-select">${lesson.exercises.map(e => `<option value="${e.id}">${t('exercise')} ${String(e.no).padStart(2,'0')}${e.page ? ' · '+t('page')+' '+e.page : ''}${state.reviewed[e.id] ? ' ✓' : ''}</option>`).join('')}</select><div id="exercise-workspace"></div></aside></div>
    <details class="reader-text"><summary>${t('selectable')}</summary><p class="reference-label" style="padding:0 16px">${t('extracted')}</p><pre id="source-text"></pre></details>
    <div class="lesson-pagination"><button type="button" class="button" id="previous-page">${t('previousPage')}</button><button type="button" class="button" id="next-page">${t('nextPage')}</button></div>
    ${lesson.audio.length ? `<section class="reference-section"><h2 class="section-title"><span class="icon">♫</span>${t('audio')}</h2><p class="hint" style="font-size:12px;color:var(--muted)">${t('audioSub')}</p><div class="audio-list">${lesson.audio.map(a => `<article class="audio-card"><strong>Track ${a.track}<small>${a.file ? t('audioReady') : t('missingCount')}</small></strong>${a.file ? `<audio controls preload="none" src="${a.file}" aria-label="Track ${a.track}"></audio>` : `<p>${t('missing')}</p>`}</article>`).join('')}</div>${lesson.scripts.length ? `<details class="reference"><summary>${t('script')}</summary><div class="reference-body">${referenceHtml(lesson.scripts,'scripts')}</div></details>` : ''}</section>` : ''}
    <section class="key-section" id="answer-key"><h2 class="section-title">✓ ${t('key')}</h2><p>${t('keySub')}</p><details class="reference" id="key-details"><summary>${t('openKey')}</summary><div class="reference-body">${referenceHtml(lesson.key,'key')}</div></details></section>
    <div class="lesson-bottom"><div id="lesson-links"></div><button type="button" class="button" id="export">↓ ${t('export')}</button></div>`;
  $('.sr-only').style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
  $('#lesson').setAttribute('aria-busy','false');
  renderPage(); renderExercise();
  const position = course.lessons.findIndex(l => l.id === lesson.id);
  $('#lesson-links').innerHTML = `${position > 0 ? `<button type="button" class="button" data-route="${course.lessons[position-1].id}">${t('prevLesson')}</button>` : ''} ${position < course.lessons.length-1 ? `<button type="button" class="button primary" data-route="${course.lessons[position+1].id}">${t('nextLesson')}</button>` : ''}`;
}
function renderPage() {
  const page = lesson.pages[pageIndex];
  $('#page-nav').innerHTML = `<span style="font-size:11px;color:var(--muted);margin-right:5px">${t('page')}</span>`+lesson.pages.map((p,i) => `<button type="button" data-page="${i}" aria-current="${i === pageIndex}" aria-label="${t('page')} ${p.number}">${p.number}</button>`).join('');
  $('#source-image').src = page.file;
  $('#source-image').width = page.width;
  $('#source-image').height = page.height;
  $('#source-image').alt = `Unit ${lesson.unit} · ${lesson.skill} · ${t('page')} ${page.number} — ${state.lang === 'vi' ? 'bài học, câu hỏi và hình ảnh gốc' : 'original lesson, questions and illustrations'}`;
  $('#source-caption').textContent = `${t('page')} ${page.number} · ${pageIndex+1}/${lesson.pages.length} · ${lesson.skill.toUpperCase()}`;
  $('#source-text').textContent = page.text;
  $('#previous-page').disabled = pageIndex === 0;
  $('#next-page').disabled = pageIndex === lesson.pages.length-1;
  state.page[lesson.id] = page.number; save();
}
function renderExercise() {
  $('#exercise-select').value = exercise.id;
  const a = state.answers[exercise.id] || {};
  const pageHint = exercise.page ? '' : `<p class="hint">${t('pageNotMapped')}</p>`;
  $('#exercise-workspace').innerHTML = `${pageHint}${exercise.questions.length ? `<p class="hint">${t('gradeHint')}</p><div class="answer-fields">${exercise.questions.map(q => `<div class="answer-field"><label for="q-${esc(q.no)}">${t('question')} ${esc(q.no)}</label><input id="q-${esc(q.no)}" data-question="${esc(q.no)}" autocomplete="off" spellcheck="false" aria-label="${t('question')} ${esc(q.no)}" value="${esc(a[q.no] || '')}"><p class="feedback" id="feedback-${esc(q.no)}"></p></div>`).join('')}</div><div class="answer-state"><span>${storageWarning ? t('notSaved') : t('saved')}</span><span id="score"></span></div><div class="note-actions"><button type="button" class="button primary" id="check">${t('check')}</button><button type="button" class="button" data-key>${t('showKey')}</button></div>` : `<p class="hint">${t('openHint')}</p><textarea id="response" aria-label="${t('notes')} — ${t('exercise')} ${exercise.no}" placeholder="${t('response')}">${esc(a.response || '')}</textarea><div class="answer-state"><span id="save-state">${storageWarning ? t('notSaved') : t('saved')}</span><span id="word-count">${countWords(a.response)} ${t('words')}</span></div><button type="button" class="button" data-key>${t('showKey')}</button>`}<div class="self-review"><p>${t('reviewHint')}</p><label><input type="checkbox" id="reviewed" ${state.reviewed[exercise.id] ? 'checked' : ''}>${t('reviewed')}</label></div>`;
}
function goPage(index) { if(index<0 || index>=lesson.pages.length) return; pageIndex=index;renderPage();const first=lesson.exercises.find(e=>e.page===lesson.pages[index].number);if(first){exercise=first;state.selected[lesson.id]=exercise.id;save();renderExercise();} }
function revealKey() { $('#key-details').open = true; $('#answer-key').scrollIntoView({behavior:'smooth',block:'start'}); }
function zoomPage() {
  const page=lesson.pages[pageIndex];$('#zoom-title').textContent=`${t('page')} ${page.number} · ${lesson.skill}`;
  $('#zoom-content').innerHTML=`<img src="${page.file}" alt="${esc($('#source-image').alt)}">`;$('#zoom').showModal();
}
function check() {
  let correct=0, attempted=0;
  const a=state.answers[exercise.id] || {};
  for(const q of exercise.questions) {
    const result=markAnswer(a[q.no],q.accepted);
    const input=$(`[data-question="${q.no}"]`), feedback=document.getElementById('feedback-'+q.no);
    input.classList.remove('correct','incorrect');input.removeAttribute('aria-invalid');
    if(result!=='empty'){attempted++;input.classList.add(result);if(result==='correct')correct++;else input.setAttribute('aria-invalid','true');}
    feedback.textContent = result==='empty' ? t('unanswered') : `${t(result)} · ${t('expected')}: ${q.display || q.accepted.join(' / ')}`;
    feedback.classList.add('visible');
  }
  $('#score').textContent=`${correct}/${attempted} · ${t('checked')}`;
  if(!attempted)toast(t('unanswered'));
}
function downloadAnswers() {
  const text=[`Mindset for IELTS — Unit ${lesson.unit} — ${lesson.skill}`,`${t('page')} ${lesson.pages[0].number}–${lesson.pages.at(-1).number}`,'',...lesson.exercises.flatMap(e=>{const a=state.answers[e.id]||{};return [`${t('exercise')} ${e.no}${e.page ? ` (${t('page')} ${e.page})` : ''}`,e.questions.length ? e.questions.map(q=>`${t('question')} ${q.no}: ${a[q.no] || ''}`).join('\n') : a.response || '',`${t('complete')}: ${state.reviewed[e.id] ? '✓' : '—'}`,''];})].join('\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`Mindset-${lesson.id}-answers.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast(t('exportDone'));
}
document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.lang){state.lang=b.dataset.lang;save();if(lesson)renderLesson();return;}
  if(b.dataset.route){location.hash=b.dataset.route;return;}
  if(b.dataset.page!==undefined){goPage(Number(b.dataset.page));return;}
  if(b.hasAttribute('data-key')){revealKey();return;}
  if(b.hasAttribute('data-zoom-page')){zoomPage();return;}
  if(b.dataset.crop){const [name,index]=b.dataset.crop.split(':');const p=lesson[name][Number(index)];$('#zoom-title').textContent=`${name==='key' ? 'Answer Key' : 'Listening Scripts'} · ${t('page')} ${p.page}`;$('#zoom-content').innerHTML=cropHtml(p,name,Number(index));$('#zoom-content').querySelector('button').removeAttribute('data-crop');$('#zoom').showModal();return;}
  if(b.id==='close-zoom')$('#zoom').close();
  if(b.id==='previous-page')goPage(pageIndex-1);
  if(b.id==='next-page')goPage(pageIndex+1);
  if(b.id==='check')check();
  if(b.id==='export')downloadAnswers();
  if(b.id==='retry')loadLesson();
});
document.addEventListener('input',event=>{
  const el=event.target;if(!exercise)return;
  if(el.dataset.question || el.id==='response'){
    state.answers[exercise.id] ||= {};state.answers[exercise.id][el.dataset.question || 'response']=el.value;
    const ok=save();
    if(el.id==='response'){$('#word-count').textContent=`${countWords(el.value)} ${t('words')}`;$('#save-state').textContent=ok?t('saved'):t('notSaved');}
    if(el.dataset.question){el.classList.remove('correct','incorrect');el.removeAttribute('aria-invalid');document.getElementById('feedback-'+el.dataset.question).classList.remove('visible');if($('#score'))$('#score').textContent='';}
  }
});
document.addEventListener('change',event=>{
  if(event.target.id==='exercise-select'){
    exercise=lesson.exercises.find(e=>e.id===event.target.value);state.selected[lesson.id]=exercise.id;
    if(exercise.page){const ix=lesson.pages.findIndex(p=>p.number===exercise.page);if(ix>=0){pageIndex=ix;renderPage();}}
    save();renderExercise();
  }
  if(event.target.id==='reviewed'){state.reviewed[exercise.id]=event.target.checked;save();renderNavigation();const option=$('#exercise-select').selectedOptions[0];option.textContent=`${t('exercise')} ${String(exercise.no).padStart(2,'0')}${exercise.page?' · '+t('page')+' '+exercise.page:''}${state.reviewed[exercise.id]?' ✓':''}`;}
});
document.addEventListener('play',event=>{if(event.target.tagName==='AUDIO')document.querySelectorAll('audio').forEach(a=>{if(a!==event.target)a.pause();});},true);
$('#zoom').addEventListener('click',event=>{if(event.target===$('#zoom'))$('#zoom').close();});
async function loadLesson() {
  const token=++requestId,id=parseRoute(location.hash,course.lessons.map(l=>l.id));
  if(location.hash!==`#${id}`)history.replaceState(null,'',`#${id}`);
  $('#lesson').setAttribute('aria-busy','true');
  try{
    if(!cache.has(id)){const res=await fetch(`data/${id}.json`);if(!res.ok)throw Error('HTTP '+res.status);cache.set(id,await res.json());}
    if(token!==requestId)return;lesson=cache.get(id);renderLesson();
    if(token>1)$('#lesson').scrollIntoView({block:'start'});
  }catch(e){if(token!==requestId)return;$('#lesson').setAttribute('aria-busy','false');$('#lesson').innerHTML=`<div class="error"><p>${t('failure')}</p><button type="button" id="retry" class="button">${t('retry')}</button></div>`;console.error(e);}
}
window.addEventListener('hashchange',()=>{if(course)loadLesson();});
try{const res=await fetch('data/course.json');if(!res.ok)throw Error('Course unavailable');course=await res.json();await loadLesson();}catch(e){$('#lesson').setAttribute('aria-busy','false');$('#lesson').innerHTML=`<div class="error">${t('failure')} <button type="button" class="button" onclick="location.reload()">${t('reload')}</button></div>`;console.error(e);}
