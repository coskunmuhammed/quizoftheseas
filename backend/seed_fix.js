
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
    console.log('Robust Seeding started...');

    const categories = [
        { name: '149 GT - COLREG' },
        { name: '149 GT - Seyir' },
        { name: '149 GT - Gemicilik' }
    ];

    for (const cat of categories) {
        console.log(`Processing category: ${cat.name}`);

        // Try to get category first
        let { data: existingCat } = await supabase.from('categories').select('id').eq('name', cat.name).single();

        let categoryId;
        if (existingCat) {
            categoryId = existingCat.id;
            console.log(`Category exists: ${cat.name} (ID: ${categoryId})`);
        } else {
            console.log(`Inserting category: ${cat.name}`);
            const { data: newCat, error: insErr } = await supabase.from('categories').insert({ name: cat.name }).select();
            if (insErr) {
                console.error(`Error inserting category ${cat.name}:`, JSON.stringify(insErr, null, 2));
                continue;
            }
            categoryId = newCat[0].id;
            console.log(`Inserted category: ${cat.name} (ID: ${categoryId})`);
        }

        const questions = [];
        if (cat.name === '149 GT - COLREG') {
            questions.push({
                category_id: categoryId,
                question_text: 'Denizde Çatışmayı Önleme Tüzüğü (COLREG) uyarınca, "yetişen gemi" tanımı hangisidir?',
                option_a: 'Diğer geminin kemere hattının 22.5 derece gerisinden gelen gemi',
                option_b: 'Diğer geminin tam pruvasından gelen gemi',
                option_c: 'Diğer gemiye 2 milden daha yakın olan gemi',
                option_d: 'Diğer geminin sadece borda fenerlerini gören gemi',
                correct_option: 'a',
                explanation: 'COLREG Kural 13 uyarınca, bir gemiye onun kemere hattının 22.5 dereceden (2 kerte) daha fazla gerisindeki bir mevkiden yaklaşan gemi yetişen gemidir.'
            });
        } else if (cat.name === '149 GT - Seyir') {
            questions.push({
                category_id: categoryId,
                question_text: 'Haritada "Fl(2) 10s 15m 12M" şeklinde belirtilen bir fenerin anlamı nedir?',
                option_a: 'Her 10 saniyede 2 kere çakan, 15 metre yükseklikte, 12 mil görünürlükte grup şimşekli fener',
                option_b: 'Sadece gece yanan, 10 mil görünürlükte fener',
                option_c: 'Rengi her 15 saniyede değişen fener',
                option_d: '15 metre derinlikteki sığlığı gösteren fener',
                correct_option: 'a',
                explanation: 'Fl(2) grup şimşekli olduğunu, 10s periyodunu, 15m deniz seviyesinden yüksekliğini, 12M ise coğrafi görünüş mesafesini belirtir.'
            });
        } else if (cat.name === '149 GT - Gemicilik') {
            questions.push({
                category_id: categoryId,
                question_text: 'Bir geminin baş tarafındaki demirleme ekipmanlarının genel adı nedir?',
                option_a: 'Irgat',
                option_b: 'Bumba',
                option_c: 'Kuntra',
                option_d: 'Puntel',
                correct_option: 'a',
                explanation: 'Gemilerde demir atmaya ve almaya yarayan, aynı zamanda halat manevralarında kullanılan mekanizmaya ırgat denir.'
            });
        }

        for (const q of questions) {
            const { error: qsErr } = await supabase.from('questions').upsert(q, { onConflict: 'question_text' });
            if (qsErr) console.error(`Error inserting question for ${cat.name}:`, qsErr);
            else console.log(`Question inserted for ${cat.name}`);
        }
    }
    console.log('Seeding finished.');
}

seed();
