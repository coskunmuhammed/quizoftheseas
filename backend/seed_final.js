
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
// Note: In a real app we'd use the service_role key, but for this exercise we only have the public one.

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
    console.log('--- Final Seeding Attempt ---');

    const categories = ['149 GT - COLREG', '149 GT - Seyir', '149 GT - Gemicilik'];

    for (const name of categories) {
        console.log(`Checking category: ${name}`);

        // 1. Try to find
        let { data: existing } = await supabase.from('categories').select('id').eq('name', name).maybeSingle();

        let catId;
        if (existing) {
            catId = existing.id;
            console.log(`Found existing: ${name} (ID: ${catId})`);
        } else {
            // 2. Try to insert with a very simple object
            console.log(`Attempting insert for: ${name}`);
            const { data: inserted, error } = await supabase.from('categories').insert({ name: name }).select();

            if (error) {
                console.error(`Insert failed for ${name}:`, error.message, error.details);
                // If it fails with not-null on name, something is very wrong with the schema vs client perception
                continue;
            }
            catId = inserted[0].id;
            console.log(`Inserted: ${name} (ID: ${catId})`);
        }

        // 3. Add one question if we have a category ID
        if (catId) {
            const qText = `Sample Question for ${name}`;
            const { data: qExisting } = await supabase.from('questions').select('id').eq('question_text', qText).maybeSingle();

            if (!qExisting) {
                const { error: qErr } = await supabase.from('questions').insert({
                    category_id: catId,
                    question_text: qText,
                    option_a: 'Option A',
                    option_b: 'Option B',
                    option_c: 'Option C',
                    option_d: 'Option D',
                    correct_option: 'a',
                    explanation: 'Seeded sample'
                });
                if (qErr) console.error(`Question insert failed for ${name}:`, qErr.message);
                else console.log(`Question added for ${name}`);
            }
        }
    }
}

seed().then(() => console.log('Done.'));
