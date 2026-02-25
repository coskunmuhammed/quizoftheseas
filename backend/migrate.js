
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
    console.log('Migration started...');

    try {
        const db = await open({
            filename: 'c:/Users/Dell/Desktop/Derin Deniz/backend/database.sqlite',
            driver: sqlite3.Database
        });

        // 1. Migrate Categories
        const categories = await db.all('SELECT * FROM categories');
        console.log(`Found ${categories.length} categories.`);

        for (const cat of categories) {
            const { data, error } = await supabase
                .from('categories')
                .upsert({ id: cat.id, name: cat.name })
                .select();

            if (error) console.error('Category error:', error);
            else console.log(`Category ${cat.name} migrated.`);
        }

        // 2. Migrate Questions
        const questions = await db.all('SELECT * FROM questions');
        console.log(`Found ${questions.length} questions.`);

        for (const q of questions) {
            const { error } = await supabase
                .from('questions')
                .upsert({
                    id: q.id,
                    category_id: q.category_id,
                    question_text: q.question_text,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    correct_option: q.correct_option,
                    explanation: q.explanation
                });

            if (error) console.error('Question error:', error);
            else console.log(`Question ${q.id} migrated.`);
        }

        console.log('Migration completed successfully!');
        await db.close();
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
