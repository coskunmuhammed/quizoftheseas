const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Attempting to list models...");
        // The SDK might not have a direct listModels but we can check the error or try a simple generation
        const result = await model.generateContent("test");
        console.log("Success with gemini-1.5-flash");
    } catch (e) {
        console.error("Error with gemini-1.5-flash:", e.message);
        console.log("\nTrying to find available models via API directly...");

        const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log("Available Models:");
            data.models?.forEach(m => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } catch (fetchError) {
            console.error("Fetch error:", fetchError.message);
        }
    }
}

listModels();
