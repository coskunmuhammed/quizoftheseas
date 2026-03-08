const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;

async function checkModels() {
    console.log("Checking API Key starts with:", API_KEY?.substring(0, 5));
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const res = await axios.get(url);
        console.log("Available Models (v1beta):");
        res.data.models.forEach(m => {
            if (m.name.includes('flash')) {
                console.log(`- ${m.name} [${m.supportedGenerationMethods.join(', ')}]`);
            }
        });

        const urlV1 = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
        const resV1 = await axios.get(urlV1);
        console.log("\nAvailable Models (v1):");
        resV1.data.models.forEach(m => {
            if (m.name.includes('flash')) {
                console.log(`- ${m.name} [${m.supportedGenerationMethods.join(', ')}]`);
            }
        });

    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
}

checkModels();
