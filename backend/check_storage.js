const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkStorage() {
    console.log('--- Checking Supabase Storage ---');
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error.message);
        console.log('This might be because the key does not have permission to list buckets (standard for anon key).');
    } else {
        console.log('Available buckets:', buckets.map(b => b.name));
    }

    // Try to list files in question-images
    const { data: files, error: fileError } = await supabase.storage.from('question-images').list();
    if (fileError) {
        console.error('Error listing files in question-images:', fileError.message);
    } else {
        console.log('Files in question-images bucket:', files.length);
        if (files.length > 0) {
            console.log('Sample file:', files[0].name);
            const res = supabase.storage.from('question-images').getPublicUrl(files[0].name);
            console.log('Full Result:', JSON.stringify(res, null, 2));
        }
    }
}

checkStorage();
