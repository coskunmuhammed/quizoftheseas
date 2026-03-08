const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkData() {
    const { data: students } = await supabase.from('students').select('*');
    const { data: admins } = await supabase.from('admins').select('*');

    console.log('---ÖĞRENCİLER---');
    (students || []).forEach(s => console.log(`AD: ${s.name || s.username} | BİTİŞ: ${s.expires_at || 'Süresiz'}`));

    console.log('\n---ADMİNLER---');
    (admins || []).forEach(a => console.log(`KULLANICI: ${a.username} | ROL: ${a.role}`));
}
checkData();
