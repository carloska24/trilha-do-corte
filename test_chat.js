const chat = async () => {
  try {
    console.log('Sending request to http://localhost:3000/api/ai/chat...');
    const res = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'oi', contextHistory: [] }),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (e) {
    console.error('Fetch error:', e);
  }
};
chat();
