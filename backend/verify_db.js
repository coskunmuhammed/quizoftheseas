const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function check() {
    const dbPath = 'c:/Users/Dell/Desktop/Derin Deniz/backend/database.sqlite';
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const count = await db.get('SELECT COUNT(*) as cnt FROM questions');
    console.log('Total Questions in Node:', count.cnt);

    const cats = await db.all('SELECT * FROM categories');
    console.log('Total Categories in Node:', cats.length);
    cats.forEach(c => console.log(`ID: ${c.id}, Name: ${c.name}`));

    await db.close();
}

check().catch(console.error);
