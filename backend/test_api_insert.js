
const axios = require('axios');
async function testApi() {
    try {
        const res = await axios.post('http://localhost:5000/api/categories', { name: 'API Test ' + Date.now() });
        console.log('API Success:', res.data);
    } catch (e) {
        console.log('API Error:', e.response ? e.response.data : e.message);
    }
}
testApi();
