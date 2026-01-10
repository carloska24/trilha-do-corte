// Native fetch used

const BASE_URL = 'http://localhost:3000/api'; // Adjust port if needed
const TIMEOUT = 5000;

// Helper for Local Date YYYY-MM-DD
function getLocalDate(addDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function testScheduling() {
  console.log('🚀 Starting Scheduling Deep Test (Local Time Corrected)...');

  // 1. GET Appointments (Public/Guest)
  try {
    const res = await fetch(`${BASE_URL}/appointments`);
    if (res.ok) {
      const data = await res.json();
      console.log('✅ GET /appointments (Public): OK', data.data.length, 'appointments found');
    } else {
      console.error('❌ GET /appointments Failed', res.status);
    }
  } catch (e) {
    console.error('❌ Connection Failed:', e.message);
    return;
  }

  // 2. Test Business Rule: Sunday (Closed)
  // Calculate days until next Sunday
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 5=Fri
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;

  const sundayDate = getLocalDate(daysUntilSunday);

  console.log(`\n🧪 Testing Sunday Booking (${sundayDate})...`);
  const resSunday = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: 'Test Sunday',
      serviceId: '1',
      date: sundayDate,
      time: '10:00',
      price: 35,
      phone: '999999999',
    }),
  });

  if (resSunday.status === 400 || resSunday.status === 409) {
    const err = await resSunday.json();
    if (err.error && (err.error.includes('domingos') || err.error.includes('fechado'))) {
      console.log('✅ Sunday Booking Blocked Correctly:', err.error);
    } else {
      console.log('⚠️ Sunday Booking Blocked but unexpected message:', JSON.stringify(err));
    }
  } else if (resSunday.ok) {
    console.error('❌ CRITICAL: Sunday Booking ALLOWED!');
    // Cleanup
    const json = await resSunday.json();
    // Optional: Delete
  } else {
    console.log('❓ Unexpected Sunday Status:', resSunday.status);
  }

  // 3. Test Business Rule: Outside Hours (07:00 and 21:00)
  console.log('\n🧪 Testing Shop Hours...');
  // Use a Tuesday (safe day)
  const dayOfWeekToday = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysUntilTuesday = (2 - dayOfWeekToday + 7) % 7; // Calculate days until next Tuesday (2)
  const daysToAdd = daysUntilTuesday === 0 ? 7 : daysUntilTuesday; // If today is Tuesday, add 7 for next Tuesday
  const validDate = getLocalDate(daysToAdd);
  console.log(`Using Valid Date: ${validDate} (Tuesday)`);

  // 07:00 (Too early)
  const resEarly = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: 'Early Bird',
      serviceId: '1',
      date: validDate,
      time: '07:00',
      price: 35,
      phone: '999999999',
    }),
  });
  const earlyJson = await resEarly.json();
  if (resEarly.status === 400) {
    console.log('✅ 07:00 Blocked Correctly:', earlyJson.error);
  } else {
    console.error(`❌ 07:00 NOT Blocked correctly. Status: ${resEarly.status}`, earlyJson);
  }

  // 21:00 (Too late)
  const resLate = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: 'Night Owl',
      serviceId: '1',
      date: validDate,
      time: '21:00',
      price: 35,
      phone: '999999999',
    }),
  });
  const lateJson = await resLate.json();
  if (resLate.status === 400) {
    console.log('✅ 21:00 Blocked Correctly:', lateJson.error);
  } else {
    console.error(`❌ 21:00 NOT Blocked correctly. Status: ${resLate.status}`, lateJson);
  }

  // 4. Test Double Booking
  console.log(`\n🧪 Testing Double Booking on ${validDate} at 14:00...`);
  // Create First
  const res1 = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: 'First Booker',
      serviceId: '1',
      date: validDate,
      time: '14:00',
      price: 35,
      phone: '111111111',
    }),
  });

  if (res1.ok || res1.status === 409) {
    // 409 means it already exists which is fine for setup
    if (res1.ok) console.log('✅ First Appointment Created');
    else console.log('ℹ️ First Appointment already existed (OK)');

    // Try Second
    const res2 = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: 'Second Booker',
        serviceId: '1',
        date: validDate,
        time: '14:00',
        price: 35,
        phone: '222222222',
      }),
    });

    const json2 = await res2.json();
    if (res2.status === 409) {
      console.log('✅ Double Booking Prevented (409 Conflict):', json2.error);
    } else {
      console.error(`❌ Double Booking ALLOWED or unexpected error. Status: ${res2.status}`, json2);
    }
  } else {
    console.error('Could not create first appointment', await res1.text());
  }
}

testScheduling();
