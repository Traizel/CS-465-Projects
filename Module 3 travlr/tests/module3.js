// Verify the JSON/controller/view contract and a changed collection, not just HTTP 200.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const hbs = require('hbs');
const app = require('../app');
const trips = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/trips.json'), 'utf8'));

const server = app.listen(0, '127.0.0.1', async () => {
  const origin = `http://127.0.0.1:${server.address().port}`;
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'travlr-module3-'));
  try {
    const html = await (await fetch(origin + '/travel')).text();
    const list = html.match(/<ul id="sites">([\s\S]*?)<\/ul>/)[1];
    assert.equal((list.match(/<li>/g) || []).length, trips.length);
    for (const trip of trips) {
      assert(trip.description.includes(trip.name), 'Trip name must appear in the description');
      assert(html.includes(trip.description), 'Description HTML must render, not be escaped');
      assert(html.includes(`/images/${trip.image}`));
    }
    const legacy = await fetch(origin + '/travel.html', { redirect: 'manual' });
    assert.equal(legacy.status, 302);
    assert.equal(legacy.headers.get('location'), '/travel');

    // Run an unchanged copy of the real controller against a different JSON file.
    // This proves that the trip content and count come from data, without touching
    // the submitted JSON file or requiring changes to the real template.
    const controllerDir = path.join(fixture, 'app_server/controllers');
    fs.mkdirSync(controllerDir, { recursive: true });
    fs.mkdirSync(path.join(fixture, 'data'));
    fs.copyFileSync(path.join(__dirname, '../app_server/controllers/travel.js'),
      path.join(controllerDir, 'travel.js'));
    const sample = [{ name: 'JSON Test Cove', image: 'reef1.jpg',
      description: '<p>JSON Test Cove is supplied by the test data.</p>' }];
    fs.writeFileSync(path.join(fixture, 'data/trips.json'), JSON.stringify(sample));
    let context;
    require(path.join(controllerDir, 'travel.js')).travel({}, {
      render(view, data) { assert.equal(view, 'travel'); context = data; }
    });
    assert.deepEqual(context.trips, sample);
    const handlebars = hbs.create().handlebars;
    for (const name of ['header', 'footer']) {
      handlebars.registerPartial(name, fs.readFileSync(
        path.join(__dirname, `../app_server/views/partials/${name}.hbs`), 'utf8'));
    }
    const template = fs.readFileSync(path.join(__dirname, '../app_server/views/travel.hbs'), 'utf8');
    const changed = handlebars.compile(template)(context);
    const changedList = changed.match(/<ul id="sites">([\s\S]*?)<\/ul>/)[1];
    assert.equal((changedList.match(/<li>/g) || []).length, 1);
    assert(changedList.includes(sample[0].description));
    for (const trip of trips) assert(!changedList.includes(trip.name));
    context.trips = [];
    assert(!handlebars.compile(template)(context).match(/<ul id="sites">([\s\S]*?)<\/ul>/)[1].includes('<li>'));
    console.log('PASS: JSON trip count, names, images, HTML descriptions, legacy redirect, changed JSON fixture, and empty collection.');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
    server.close();
  }
});
