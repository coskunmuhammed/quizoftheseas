const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkData() {
    console.log('--- Inspecting Questions Data ---');
    const { data, error } = await supabase.from('questions').select('id, question_text, image_url').not('image_url', 'is', null).limit(5);

    if (error) {
        console.error('Error fetching questions:', error.message);
    } else {
        console.log('Found questions with images:', data.length);
        data.forEach(q => {
            console.log(`ID: ${q.id} | Text: ${q.question_text} | URL: ${q.image_url}`);
        });
    }
}

checkData();
