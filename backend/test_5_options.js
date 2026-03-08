
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test5Options() {
    console.log('Testing 5-option question insertion...');

    // We assume the user has run the ALTER TABLE command as instructed in the plan.
    // If not, this script will fail with a 'column option_e does not exist' error.

    const q = {
        category_id: 1,
        question_text: 'Test 5-Option Question ' + Date.now(),
        option_a: 'Option A',
        option_b: 'Option B',
        option_c: 'Option C',
        option_d: 'Option D',
        option_e: 'Option E (New)',
        correct_option: 'e',
        explanation: 'Testing new option_e column'
    };

    const { data, error } = await supabase.from('questions').insert(q).select();

    if (error) {
        console.error('--- INSERT ERROR ---');
        console.error('Message:', error.message);
        console.error('Hint: Did you run the ALTER TABLE sql command in Supabase?');
    } else {
        console.log('Successfully inserted 5-option question!', data);

        // Clean up
        const { error: delError } = await supabase.from('questions').delete().eq('id', data[0].id);
        if (delError) console.error('Cleanup error:', delError);
        else console.log('Cleanup successful.');
    }
}

test5Options();
