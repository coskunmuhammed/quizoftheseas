
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getSchema() {
    // We can use a trick to get column names if RPC isn't available: 
    // SELECT * FROM table LIMIT 0 returns column names.
    const { data: catData, error: err1 } = await supabase.from('categories').select('*').limit(0);
    console.log('Categories Columns:', catData); // Should be empty array but metadata might have info? No.

    // Let's try to get one row again but look at the casing very carefully
    const { data: catRow } = await supabase.from('categories').select('*').limit(1);
    console.log('First Category Row:', JSON.stringify(catRow, null, 2));

    const { data: qRow } = await supabase.from('questions').select('*').limit(1);
    console.log('First Question Row:', JSON.stringify(qRow, null, 2));
}

getSchema();
