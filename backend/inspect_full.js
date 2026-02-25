
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    try {
        console.log('--- Table Schema (Categories) ---');
        // Simple select to see columns
        const { data, error } = await supabase.from('categories').select('*').limit(1);
        if (error) {
            console.error('Error fetching categories:', error);
        } else {
            console.log('Columns in categories:', data.length > 0 ? Object.keys(data[0]) : 'Empty table');
        }

        console.log('--- Table Schema (Questions) ---');
        const { data: data2, error: error2 } = await supabase.from('questions').select('*').limit(1);
        if (error2) {
            console.error('Error fetching questions:', error2);
        } else {
            console.log('Columns in questions:', data2.length > 0 ? Object.keys(data2[0]) : 'Empty table');
        }
    } catch (e) {
        console.error('Runtime error:', e);
    }
}

inspect();
