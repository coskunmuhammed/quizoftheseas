
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function logKeys() {
    const { data: cat } = await supabase.from('categories').select('*').limit(1);
    if (cat && cat[0]) console.log('CAT_KEYS:', Object.keys(cat[0]).join(','));

    const { data: q } = await supabase.from('questions').select('*').limit(1);
    if (q && q[0]) console.log('Q_KEYS:', Object.keys(q[0]).join(','));
}
logKeys();
