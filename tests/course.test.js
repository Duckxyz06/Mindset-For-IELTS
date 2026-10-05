import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { markAnswer, parseRoute, countWords, readState } from '../core.js';
const course = JSON.parse(readFileSync('data/course.json'));
const lessons = course.lessons.map(l => JSON.parse(readFileSync(`data/${l.id}.json`)));

test('every teaching page in Units 1–6 appears exactly once in 24 lessons', () => {
  assert.equal(course.units.length, 6);
  assert.equal(lessons.length, 24);
  const all = lessons.flatMap(l => l.pages.map(p => p.number));
  assert.deepEqual(all, Array.from({ length: 131 }, (_, i) => i + 8));
  for (const unit of course.units) assert.deepEqual(lessons.filter(l => l.unit === unit.id).map(l => l.skill), ['reading', 'writing', 'listening', 'speaking']);
});
test('every numbered exercise has an independent response and an original answer-key section', () => {
  const ids = new Set();
  for (const lesson of lessons) {
    const expected = course.lessons.find(l => l.id === lesson.id).count;
    assert.equal(lesson.exercises.length, expected);
    assert.deepEqual(lesson.exercises.map(e => e.no), Array.from({ length: expected }, (_, i) => i + 1));
    assert.ok(lesson.key.length > 0, lesson.id);
    for (const e of lesson.exercises) {
      assert.ok(!ids.has(e.id)); ids.add(e.id);
      if (e.page) assert.ok(lesson.pages.some(p => p.number === e.page), e.id);
      for (const q of e.questions) assert.ok(q.accepted.length > 0);
    }
  }
  assert.equal(ids.size, 347);
});
test('source images and available audio are real files; crops remain inside their source page', () => {
  for (const lesson of lessons) {
    for (const page of lesson.pages) {
      const data = readFileSync(page.file);
      assert.equal(data.toString('ascii', 0, 4), 'RIFF');
      assert.equal(data.toString('ascii', 8, 12), 'WEBP');
      assert.ok(page.width >= 900 && page.height > 1000);
      assert.ok(page.text.length > 100);
    }
    for (const piece of [...lesson.key, ...lesson.scripts]) {
      assert.ok(statSync(`assets/pages/page-${String(piece.page).padStart(3, '0')}.webp`).size > 10000);
      const [x,y,w,h] = piece.rect;
      assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= 1 && y + h <= 1, `${lesson.id} page ${piece.page}`);
    }
    for (const audio of lesson.audio) if (audio.file) assert.ok(statSync(audio.file).size > 10000);
  }
  assert.equal(readdirSync('assets/pages').length, 161);
});
test('marking accepts documented alternatives and never marks blank responses as correct', () => {
  assert.equal(markAnswer('', ['']), 'empty');
  assert.equal(markAnswer('  INDUSTRY. ', ['field', 'industry']), 'correct');
  assert.equal(markAnswer('not in the key', ['field']), 'incorrect');
  const u6 = lessons.find(l => l.id === 'u6-reading');
  const final = u6.exercises.find(e => e.no === 13);
  assert.equal(markAnswer('transparent foil', final.questions.at(-1).accepted), 'correct');
});
test('invalid routes and inaccessible or corrupt storage fail safely', () => {
  const ids = course.lessons.map(l => l.id);
  assert.equal(parseRoute('#u6-speaking', ids), 'u6-speaking');
  assert.equal(parseRoute('#unknown', ids), 'u1-reading');
  assert.equal(readState({getItem:()=>'{bad'}).lang,'vi');
  assert.deepEqual(readState({getItem:()=>{throw Error('blocked');}}).answers,{});
  assert.equal(countWords('  a useful invention  '),3);
});
