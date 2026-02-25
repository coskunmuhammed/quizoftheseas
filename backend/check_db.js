
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log('--- Categories ---');
    const { data: cats, error: err1 } = await supabase.from('categories').select('*');
    if (err1) console.error(err1);
    else console.log(JSON.stringify(cats, null, 2));

    console.log('--- Questions ---');
    const { data: qs, error: err2 } = await supabase.from('questions').select('*');
    if (err2) console.error(err2);
    else console.log(`Total questions: ${qs.length}`);
}

check();
