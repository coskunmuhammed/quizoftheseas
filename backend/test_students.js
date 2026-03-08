const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testStudents() {
    console.log('--- Testing Students Table ---');
    try {
        const { data, error } = await supabase.from('students').insert({
            name: 'Test Student ' + Date.now(),
            password: 'test'
        }).select();

        if (error) {
            console.error('Error inserting student:', error.message);
            console.log('Table "students" likely does not exist yet.');
        } else {
            console.log('Success! Student created:', data[0]);

            // Cleanup
            await supabase.from('students').delete().eq('id', data[0].id);
            console.log('Test student deleted.');
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testStudents();
