const BASE_URL = 'http://localhost:3000/api';

// Helper to create a delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper for Local Date YYYY-MM-DD
function getLocalDate(addDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  // If Sunday, add 1 day
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function testLifecycle() {
  console.log('🚀 Starting Client Lifecycle Verification...');

  // 1. Create a Unique Guest (via Appointment)
  // We simulate a guest booking by NOT providing clientId
  const uniquePhone = `99${Date.now().toString().slice(-9)}`; // Unique phone
  const guestName = `Guest ${Date.now()}`;
  const date = getLocalDate(2); // In 2 days

  console.log(`\n1️⃣ Creating Guest Appointment (${guestName}, ${uniquePhone})...`);

  let appointmentId;
  let clientId;

  try {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: guestName,
        serviceId: '1',
        date: date,
        time: '14:00',
        price: 50,
        phone: uniquePhone,
      }),
    });

    const json = await res.json();
    if (res.ok) {
      appointmentId = json.data.id;
      clientId = json.data.clientId;
      console.log(`✅ Appointment Created: ${appointmentId}`);
      console.log(`✅ Guest Client Auto-Created: ${clientId}`);
    } else {
      console.error('❌ Failed to create appointment:', json);
      return;
    }
  } catch (e) {
    console.error('❌ Network Error:', e.message);
    return;
  }

  // 2. Verify Status: Should be ACTIVE !
  // (Our new logic promotes guests immediately upon booking)
  console.log('\n2️⃣ Verifying "Active" Status promotion...');
  try {
    const clientRes = await fetch(`${BASE_URL}/clients`); // We need to find ours in list or assume an endpoint by ID?
    // Clients endpoint returns all. Filter by ID.
    const clientJson = await clientRes.json();
    const myClient = clientJson.data.find(c => c.id === clientId);

    if (myClient) {
      console.log(`ℹ️ Client Status: ${myClient.status}`);
      if (myClient.status === 'active') {
        console.log('✅ PASS: Client was promoted to ACTIVE!');
      } else {
        console.error('❌ FAIL: Client status is still', myClient.status);
      }
      console.log(`ℹ️ Current Level: ${myClient.level || 1}`);
    } else {
      console.error('❌ Client not found in list');
    }
  } catch (e) {
    console.error(e);
  }

  // 3. Mark as COMPLETED -> Check Level Up & Last Visit
  console.log('\n3️⃣ Completing Appointment (Triggering Level Up)...');
  try {
    // Authenticate as Barber (required for update?)
    // updateAppointment controller doesn't seem to force auth in code I read but route might.
    // Route 'appointmentsRoutes.ts' uses authenticateToken for PUT /:id
    // Since I don't have a token easily, I will rely on my knowledge that I can bypass or need to login.
    // Wait, verification script needs to be realistic. I need a token.
    // I'll try without token first. If 401/403, I'll need to login barber.

    let token = '';
    // Login Barber standard dev?
    const loginRes = await fetch(`${BASE_URL}/login/barber`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@barber.com', password: 'admin' }), // Guessing default credentials or need to check seeds
    });

    // If login fails, I might handle it. But assuming dev environment has one.
    // Actually, let's try to register a temp barber if login fails? Too complex.
    // Let's assume the update route logic.
    // Re-reading 'appointmentsRoutes.ts' snippet from memory:
    // `router.put('/:id', authenticateToken, updateAppointment);`
    // YES, it needs token.

    // Strategy: Inspect `seed_full.js` or `authController` to know a user?
    // Or just create a new barber to run the test.

    console.log('   Creating Temp Barber for Auth...');
    const barberRes = await fetch(`${BASE_URL}/register/barber`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Barber',
        email: `barber${Date.now()}@test.com`,
        password: 'password123',
        phone: '11999999999',
      }),
    });
    const barberJson = await barberRes.json();
    if (barberJson.token) {
      token = barberJson.token;
      console.log('   ✅ Got Barber Token');
    } else {
      console.log('   ⚠️ Could not create barber. Trying update without token (might fail).');
    }

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const updateRes = await fetch(`${BASE_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({ status: 'completed' }),
    });

    if (updateRes.ok) {
      console.log('✅ Appointment Updated to COMPLETED');
    } else {
      console.error('❌ Failed to update appointment:', updateRes.status, await updateRes.text());
      return;
    }

    // 4. Verify Gamification (Level 2 & LastVisit)
    console.log('\n4️⃣ Verifying Level Up & Last Visit...');
    const verifyRes = await fetch(`${BASE_URL}/clients`);
    const verifyJson = await verifyRes.json();
    const leveledClient = verifyJson.data.find(c => c.id === clientId);

    if (leveledClient) {
      console.log(`ℹ️ New Level: ${leveledClient.level}`);
      console.log(`ℹ️ Last Visit: ${leveledClient.lastVisit}`);

      // Parse Date
      const [y, m, d] = date.split('-');
      const expectedDate = `${d}/${m}/${y}`; // Logic implemented uses appointment date

      const isLevelUp = leveledClient.level === 2;
      const isDateCorrect = leveledClient.lastVisit === expectedDate;

      if (isLevelUp) console.log('✅ PASS: Level increased to 2!');
      else console.error('❌ FAIL: Level did not increase.');

      if (isDateCorrect) console.log('✅ PASS: Last Visit updated correctly!');
      else
        console.error(
          `❌ FAIL: Last Visit mismatch. Expected ${expectedDate}, got ${leveledClient.lastVisit}`
        );
    }
  } catch (e) {
    console.error(e);
  }
}

testLifecycle();
