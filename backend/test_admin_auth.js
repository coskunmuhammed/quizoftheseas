const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
// Fallback if locally running
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testAdminAuth() {
    console.log('--- Testing Admin Auth System ---');
    try {
        // 1. Try to login with default credentials
        console.log('1. Logging in with default admin/admin123...');
        const loginRes = await axios.post(`${API_BASE}/admin/login`, {
            username: 'admin',
            password: 'admin123'
        });
        console.log('Login result:', loginRes.data);

        // 2. Change password
        console.log('2. Changing password to "admin456"...');
        const changeRes = await axios.post(`${API_BASE}/admin/change-password`, {
            username: 'admin',
            currentPassword: 'admin123',
            newPassword: 'admin456'
        });
        console.log('Change result:', changeRes.data);

        // 3. Attempt login with NEW password
        console.log('3. Logging in with NEW password "admin456"...');
        const loginRes2 = await axios.post(`${API_BASE}/admin/login`, {
            username: 'admin',
            password: 'admin456'
        });
        console.log('New Login result:', loginRes2.data);

        // 4. Reset back to admin123 for consistency
        console.log('4. Resetting password back to "admin123"...');
        await axios.post(`${API_BASE}/admin/change-password`, {
            username: 'admin',
            currentPassword: 'admin456',
            newPassword: 'admin123'
        });
        console.log('System reset complete.');

    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

testAdminAuth();
