import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// Path to the SQLite database
const dbPath = path.join(__dirname, '../offline.sqlite');

async function getDb() {
    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// API Routes (Offline version reads from SQLite only)
app.get('/api/categories', async (req, res) => {
    try {
        const db = await getDb();
        const categories = await db.all('SELECT * FROM categories ORDER BY id ASC');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Offline DB Error' });
    }
});

app.get('/api/questions', async (req, res) => {
    try {
        const { category_id } = req.query;
        const db = await getDb();
        let questions;
        if (category_id) {
            questions = await db.all('SELECT * FROM questions WHERE category_id = ?', [category_id]);
        } else {
            questions = await db.all('SELECT * FROM questions');
        }
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: 'Offline DB Error' });
    }
});

// Fallback to React App
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`  Quiz of the Seas - OFFLINE VERSION`);
    console.log(`  Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`-------------------------------------------`);
});
