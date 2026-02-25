
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    console.log('--- Inspecting Categories ---');
    // We can't easily get schema via JS client without RPC, but we can try to fetch one row and see all keys
    const { data: cat, error: err1 } = await supabase.from('categories').select('*').limit(1);
    console.log('Category Keys:', cat && cat.length > 0 ? Object.keys(cat[0]) : 'No data');

    console.log('--- Inspecting Questions ---');
    const { data: q, error: err2 } = await supabase.from('questions').select('*').limit(1);
    console.log('Question Keys:', q && q.length > 0 ? Object.keys(q[0]) : 'No data');
}

inspect();
