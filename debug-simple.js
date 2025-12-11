const apiKey = "AIzaSyCTG-8W-LLtBnVUnLYukP_2qwjdGcf2F0Y"; 

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  console.log('Fetching models from:', url);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('API Error:', JSON.stringify(data.error, null, 2));
      return;
    }
    
    if (!data.models) {
      console.log('No models found in response:', data);
      return;
    }

    console.log('Available Models:');
    data.models.forEach(m => {
      if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
        console.log(`- ${m.name}`);
      }
    });
  } catch (e) {
    console.error('Fetch Error:', e.message);
  }
}

listModels();
