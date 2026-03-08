const axios = require('axios');
const API_KEY = 'AIzaSyAzNVqQMVAFhh5-0d1FgJUnrguIr1g8Ovg';

const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
    'gemini-pro'
];

async function check() {
    for (const v of ['v1', 'v1beta']) {
        console.log(`\nVERSION: ${v}`);
        for (const m of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/${v}/models/${m}?key=${API_KEY}`;
                const res = await axios.get(url);
                console.log(`[OK] ${m} exists. Methods: ${res.data.supportedGenerationMethods.join(', ')}`);
            } catch (err) {
                console.log(`[FAIL] ${m}: ${err.response?.status} ${err.response?.statusText}`);
            }
        }
    }
}

check();
