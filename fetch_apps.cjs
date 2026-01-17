const http = require('http');

http
  .get('http://localhost:3000/api/appointments', resp => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', chunk => {
      data += chunk;
    });

    // The whole response has been received.
    resp.on('end', () => {
      try {
        const json = JSON.parse(data);
        const apps = json.data || [];
        console.log(`Total Appointments: ${apps.length}`);

        // Log ALL appointments to see what's in the DB
        console.log('All Appointments found:');
        apps.forEach(a => {
          console.log(JSON.stringify(a, null, 2));
        });
      } catch (e) {
        console.error('Error parsing JSON:', e.message);
        console.log('Raw Data:', data.substring(0, 500));
      }
    });
  })
  .on('error', err => {
    console.log('Error: ' + err.message);
  });
