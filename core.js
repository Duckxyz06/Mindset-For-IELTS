export const STORAGE_KEY = 'mindset-unit1-6-v2';
export function normalize(value) {
  return String(value ?? '').normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').replace(/[.,;:]$/g, '');
}
export function markAnswer(value, accepted) {
  if (!normalize(value)) return 'empty';
  return accepted.some(answer => normalize(answer) === normalize(value)) ? 'correct' : 'incorrect';
}
export function parseRoute(hash, validIds) {
  const id = hash.replace(/^#/, '');
  return validIds.includes(id) ? id : validIds[0];
}
export function countWords(value) {
  return String(value ?? '').trim().match(/\S+/g)?.length || 0;
}
export function readState(storage) {
  try {
    const data = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    return { lang: data.lang === 'en' ? 'en' : 'vi', answers: data.answers && typeof data.answers === 'object' && !Array.isArray(data.answers) ? data.answers : {}, reviewed: data.reviewed && typeof data.reviewed === 'object' && !Array.isArray(data.reviewed) ? data.reviewed : {}, page: data.page && typeof data.page === 'object' ? data.page : {}, selected: data.selected && typeof data.selected === 'object' ? data.selected : {} };
  } catch {
    return { lang: 'vi', answers: {}, reviewed: {}, page: {}, selected: {} };
  }
}
