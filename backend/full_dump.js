const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function dump() {
    const { data: cats } = await supabase.from('categories').select('*').order('id');
    const { data: qs } = await supabase.from('questions').select('*').order('id');

    console.log('--- ALL CATEGORIES ---');
    cats?.forEach(c => console.log(`ID: ${c.id}, Name: ${c.name}, Parent: ${c.parent_id}`));

    console.log('\n--- ALL QUESTIONS ---');
    qs?.forEach(q => console.log(`ID: ${q.id}, CatID: ${q.category_id}, Text: ${q.question_text.slice(0, 30)}...`));
}

dump();
