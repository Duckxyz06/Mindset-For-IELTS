import { cpSync, mkdirSync, rmSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const file of ['index.html', 'styles.css', 'app.js', 'core.js', 'assets', 'data']) {
  cpSync(file, `dist/${file}`, { recursive: true });
}
console.log('Built static website: dist/');
