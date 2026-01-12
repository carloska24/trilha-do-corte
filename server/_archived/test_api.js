const login = async (url, payload) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    console.log(`Payload: ${JSON.stringify(payload)}`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
  } catch (e) {
    console.error('Fetch Error:', e.cause || e);
  }
};

console.log('--- TESTANDO LOGIN CLIENTE ---');
// Test 1: Exact Match
await login('http://localhost:3000/api/login/client', {
  emailOrPhone: '(11) 99999-1001',
  password: '123',
});

// Test 2: Unformatted (Probable User Input)
await login('http://localhost:3000/api/login/client', {
  emailOrPhone: '11999991001',
  password: '123',
});

console.log('\n--- TESTANDO LOGIN BARBEIRO ---');
await login('http://localhost:3000/api/login/barber', {
  email: 'mestre@trilha.com',
  password: '123',
});
