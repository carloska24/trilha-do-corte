import db from './db.js';
import fs from 'fs';

async function checkImages() {
  try {
    const clients = await db.query('SELECT img FROM clients WHERE img IS NOT NULL');
    const barbers = await db.query('SELECT image FROM barbers WHERE image IS NOT NULL');

    let stats = {
      cloudinary: 0,
      unsplash: 0,
      local: 0,
      other: 0,
      total: 0,
    };

    let otherUrls = [];
    const output = [];

    clients.rows.forEach(r => output.push('Client IMG: ' + r.img));
    barbers.rows.forEach(r => output.push('Barber IMG: ' + r.image));

    fs.writeFileSync('audit_output.txt', output.join('\n'));
    console.log('Written to audit_output.txt');

    // const processUrl = ...

    // console.log('--- IMAGE STORAGE AUDIT ---');
    // console.log(stats);
    if (otherUrls.length > 0) {
      console.log('❓ Found "Other" URLs:');
      otherUrls.forEach(url => console.log(' - ' + url));
    }

    if (stats.local > 0) {
      console.log('⚠️ Warning: Found local files in database!');
    } else {
      // console.log('✅ No local file references found in DB.');
    }
  } catch (err) {
    console.error(err);
  }
}

checkImages();
