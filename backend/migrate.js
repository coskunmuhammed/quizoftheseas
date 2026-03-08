
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
    console.log('Restoration started from database.sqlite...');

    try {
        const db = await open({
            filename: 'c:/Users/Dell/Desktop/Derin Deniz/backend/database.sqlite',
            driver: sqlite3.Database
        });

        // 1. Migrate Categories
        const categories = await db.all('SELECT * FROM categories');
        console.log(`Found ${categories.length} categories in backup.`);

        for (const cat of categories) {
            const { error } = await supabase
                .from('categories')
                .upsert({ id: cat.id, name: cat.name, parent_id: cat.parent_id });

            if (error) console.error(`Category ${cat.name} error:`, error.message);
            else console.log(`Category ${cat.name} restored/verified.`);
        }

        // 2. Migrate Questions
        const questions = await db.all('SELECT * FROM questions');
        console.log(`Found ${questions.length} questions in backup.`);

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
                    option_e: q.option_e || '',
                    correct_option: q.correct_option,
                    explanation: q.explanation,
                    video_url: q.video_url || null,
                    audio_url: q.audio_url || null,
                    image_url: q.image_url || null
                });

            if (error) console.error(`Question ID ${q.id} error:`, error.message);
        }

        console.log('Restoration completed successfully!');
        await db.close();
    } catch (err) {
        console.error('Restoration failed:', err);
    }
}

migrate();
