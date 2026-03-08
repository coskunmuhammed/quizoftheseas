const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF'; // I'll check if this is correct
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const { data: cats, error: catError } = await supabase.from('categories').select('*');
    const { data: qs, error: qError } = await supabase.from('questions').select('*');

    console.log('Categories count:', cats ? cats.length : 'Error or null');
    if (cats) console.log('First 5 categories:', cats.slice(0, 5));

    console.log('Questions count:', qs ? qs.length : 'Error or null');
}

check();
