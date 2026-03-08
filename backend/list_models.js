const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Use the key provided by the user directly to be 100% sure
const API_KEY = 'AIzaSyAzNVqQMVAFhh5-0d1FgJUnrguIr1g8Ovg';

async function listAllModels() {
    console.log("Checking API Key prefix:", API_KEY.substring(0, 10));

    const versions = ['v1', 'v1beta'];

    for (const v of versions) {
        console.log(`\n--- Checking API Version: ${v} ---`);
        const url = `https://generativelanguage.googleapis.com/${v}/models?key=${API_KEY}`;

        try {
            const res = await axios.get(url);
            console.log(`Found ${res.data.models?.length || 0} models.`);
            res.data.models?.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        } catch (err) {
            console.error(`Error on ${v}:`, err.response?.data || err.message);
        }
    }
}

listAllModels();
