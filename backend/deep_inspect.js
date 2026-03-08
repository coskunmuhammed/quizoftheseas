const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    const { data: cats } = await supabase.from('categories').select('*');
    const { data: qs } = await supabase.from('questions').select('*');

    console.log('--- Categories ---');
    cats.forEach(c => {
        const count = qs.filter(q => q.category_id === c.id).length;
        console.log(`[${c.id}] ${c.name} (Parent: ${c.parent_id}) - Questions: ${count}`);
    });

    const orphaned = qs.filter(q => !cats.find(c => c.id === q.category_id));
    console.log('\n--- Orphaned Questions ---');
    console.log('Count:', orphaned.length);
}

inspect();
