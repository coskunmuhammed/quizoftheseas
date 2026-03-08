import { createClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dbPath = path.join(__dirname, '../offline.sqlite');
const imagesDir = path.join(__dirname, '../../frontend/public/offline_images');

async function sync() {
    console.log('--- Syncing Data from Supabase to Local SQLite ---');

    // Ensure images directory exists
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Create tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id INTEGER
        );
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY,
            category_id INTEGER,
            question_text TEXT NOT NULL,
            option_a TEXT,
            option_b TEXT,
            option_c TEXT,
            option_d TEXT,
            option_e TEXT,
            correct_option TEXT,
            explanation TEXT,
            image_url TEXT,
            video_url TEXT,
            audio_url TEXT,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        );
    `);

    async function downloadFile(url: string, targetDir: string): Promise<string | null> {
        if (!url || !url.startsWith('http')) return url;
        try {
            const fileName = path.basename(new URL(url).pathname);
            const localPath = path.join(targetDir, fileName);

            console.log(`Downloading: ${fileName}`);
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(localPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            return `/offline_images/${fileName}`; // Using same dir for all for simplicity in offline mode
        } catch (err) {
            console.error(`Failed to download ${url}:`, err);
            return url;
        }
    }

    // 1. Sync Categories
    console.log('Fetching categories...');
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) throw catError;

    await db.run('DELETE FROM categories');
    for (const cat of categories) {
        await db.run('INSERT INTO categories (id, name, parent_id) VALUES (?, ?, ?)', [cat.id, cat.name, cat.parent_id]);
    }
    console.log(`${categories.length} categories synced.`);

    // 2. Sync Questions
    console.log('Fetching questions...');
    const { data: questions, error: qError } = await supabase.from('questions').select('*');
    if (qError) throw qError;

    await db.run('DELETE FROM questions');
    for (const q of questions) {
        const localImg = await downloadFile(q.image_url, imagesDir);
        const localVideo = await downloadFile(q.video_url, imagesDir);
        const localAudio = await downloadFile(q.audio_url, imagesDir);

        await db.run(`
            INSERT INTO questions (
                id, category_id, question_text, option_a, option_b, option_c, option_d, option_e, correct_option, explanation, image_url, video_url, audio_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [q.id, q.category_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.option_e, q.correct_option, q.explanation, localImg, localVideo, localAudio]
        );
    }
    console.log(`${questions.length} questions synced.`);

    await db.close();
    console.log('--- Sync Completed Successfully ---');
}

sync().catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
});
