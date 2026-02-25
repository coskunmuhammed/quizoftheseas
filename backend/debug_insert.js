
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugInsert() {
    const { data, error } = await supabase
        .from('categories')
        .insert({ name: 'Debug Category ' + Date.now() })
        .select();

    if (error) {
        console.log('--- ERROR DETAILS ---');
        console.log('Message:', error.message);
        console.log('Details:', error.details);
        console.log('Hint:', error.hint);
        console.log('Code:', error.code);
    } else {
        console.log('Success!', data);
    }
}
debugInsert();
