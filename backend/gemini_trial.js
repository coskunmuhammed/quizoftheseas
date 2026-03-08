const axios = require('axios');

const API_KEY = 'AIzaSyAzNVqQMVAFhh5-0d1FgJUnrguIr1g8Ovg';

const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash'
];

const versions = ['v1', 'v1beta'];

async function trial() {
    for (const v of versions) {
        for (const m of models) {
            const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${API_KEY}`;
            console.log(`Testing ${v} with ${m}...`);
            try {
                const res = await axios.post(url, {
                    contents: [{ parts: [{ text: "hi" }] }]
                });
                if (res.data.candidates) {
                    console.log(`SUCCESS! ${v} + ${m} works.`);
                    process.exit(0);
                }
            } catch (err) {
                console.log(`Failed: ${err.response?.status} - ${err.response?.data?.error?.message || err.message}`);
            }
        }
    }
}

trial();
