const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const tables = ['categories', 'questions', 'students', 'admins', 'student_results'];
    const results = [];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            results.push({ table, status: 'error', message: error.message, code: error.code });
        } else {
            results.push({ table, status: 'exists', rowCount: data.length });
        }
    }
    fs.writeFileSync('c:/Users/Dell/Desktop/Derin Deniz/table_results.json', JSON.stringify(results, null, 2));
    console.log('Results saved to table_results.json');
}

check();
