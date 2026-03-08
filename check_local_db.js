const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkLocal() {
    const dbPath = path.join(__dirname, 'backend/offline.sqlite');
    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        const cats = await db.all('SELECT * FROM categories');
        const qs = await db.all('SELECT * FROM questions');

        console.log('Local Categories count:', cats.length);
        console.log('Local Questions count:', qs.length);
        if (qs.length > 0) console.log('Sample local question:', qs[0]);

        await db.close();
    } catch (err) {
        console.error('Error opening local DB:', err);
    }
}

checkLocal();
