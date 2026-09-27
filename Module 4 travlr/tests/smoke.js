// Integration check: render real routes and follow every local page/asset link.
const assert = require('node:assert/strict');
const app = require('../app');
const server = app.listen(0, '127.0.0.1', async () => {
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const paths = ['/', '/travel', '/travel/', '/index.html', '/travel.html',
      '/rooms.html', '/meals.html', '/news.html', '/about.html', '/contact.html'];
    const assets = new Set();
    for (const path of paths) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert(!html.includes('{{'), `Unrendered HBS: ${path}`);
      assert.equal((html.match(/<!DOCTYPE html>/gi) || []).length, 1, path);
      if (['/', '/travel', '/travel/'].includes(path)) {
        assert(html.includes('<title>Travlr Getaways</title>'));
        assert(html.includes('id="header"') && html.includes('id="footer"'));
        const selected = path === '/' ? 'Home' : 'Travel';
        assert(new RegExp(`<li class="selected">\\s*<a[^>]+>${selected}</a>`).test(html));
      }
      if (path.startsWith('/travel')) {
        for (const reef of ['Gale Reef', 'Dawson’s Reef', 'Claire’s REEF']) assert(html.includes(reef));
      }
      for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) assets.add(match[1]);
    }
    for (const path of assets) assert.equal((await fetch(origin + path)).status, 200, path);
    const missing = await fetch(origin + '/missing-page');
    assert.equal(missing.status, 404);
    assert((await missing.text()).includes('Not Found'));
    console.log(`PASS: ${paths.length} pages, ${assets.size} unique local links/assets, dynamic titles/partials, active navigation, and 404 rendering.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally { server.close(); }
});
