
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testQuestion() {
    // Try to insert a question for category 1 (which definitely exists)
    const q = {
        category_id: 1,
        question_text: 'Test Question ' + Date.now(),
        option_a: 'A',
        option_b: 'B',
        option_c: 'C',
        option_d: 'D',
        correct_option: 'a',
        explanation: 'Test'
    };
    const { data, error } = await supabase.from('questions').insert(q).select();
    if (error) {
        console.log('--- QUESTION ERROR ---');
        console.log('Message:', error.message);
        console.log('Details:', error.details);
        console.log('Hint:', error.hint);
        console.log('Code:', error.code);
    } else {
        console.log('Question Success!', data);
    }
}
testQuestion();
