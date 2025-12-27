// import fetch from 'node-fetch'; // Native fetch available in Node 22

// Native fetch (Node 18+)
const fetchServices = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/services');
    const json = await response.json();

    console.log('--- API DEBUG REPORT ---');
    console.log('Total Services:', json.data.length);

    const targets = json.data.filter(
      s =>
        s.name.includes('Depilação') ||
        s.name.includes('Limpeza') ||
        s.category === 'Estética' ||
        s.category === 'Estetica'
    );

    if (targets.length === 0) {
      console.log('⚠️ No services found with name "Depilação" or "Limpeza"');
      // Log all categories found
      const cats = [...new Set(json.data.map(s => s.category))];
      console.log('Available Categories:', cats);
    } else {
      console.log('Found Targets:');
      targets.forEach(t => {
        console.log(
          `ID: ${t.id} | Name: ${t.name} | Category: "${
            t.category
          }" | Typeof Category: ${typeof t.category}`
        );
      });
    }
    console.log('------------------------');
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

fetchServices();
