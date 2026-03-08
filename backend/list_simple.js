const axios = require('axios');
const API_KEY = 'AIzaSyAzNVqQMVAFhh5-0d1FgJUnrguIr1g8Ovg';
async function list() {
    try {
        const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        console.log("V1BETA MODELS:");
        res.data.models.forEach(m => console.log(m.name));

        const res1 = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
        console.log("\nV1 MODELS:");
        res1.data.models.forEach(m => console.log(m.name));
    } catch (e) {
        console.log("Error:", e.response?.data || e.message);
    }
}
list();
