import { Router } from 'express';
import { openDb } from '../db/database';

const router = Router();

// --- Categories ---
router.get('/categories', async (req, res) => {
    const db = await openDb();
    const categories = await db.all('SELECT * FROM categories');
    res.json(categories);
});

router.post('/categories', async (req, res) => {
    const { name } = req.body;
    const db = await openDb();
    try {
        const result = await db.run('INSERT INTO categories (name) VALUES (?)', [name]);
        res.status(201).json({ id: result.lastID, name });
    } catch (err) {
        res.status(400).json({ error: 'Category already exists' });
    }
});

// --- Questions ---
router.get('/questions', async (req, res) => {
    const { category_id } = req.query;
    const db = await openDb();
    let questions;
    if (category_id) {
        questions = await db.all('SELECT * FROM questions WHERE category_id = ?', [category_id]);
    } else {
        questions = await db.all('SELECT * FROM questions');
    }
    res.json(questions);
});

router.post('/questions', async (req, res) => {
    const { category_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;
    const db = await openDb();
    const result = await db.run(
        'INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [category_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation]
    );
    res.status(201).json({ id: result.lastID, ...req.body });
});

// Export all data
router.get('/export', async (req, res) => {
    try {
        const db = await openDb();
        const categories = await db.all('SELECT * FROM categories');
        const questions = await db.all('SELECT * FROM questions');
        res.json({ categories, questions });
    } catch (err) {
        res.status(500).json({ error: 'Export failed' });
    }
});

// Import data
router.post('/import', async (req, res) => {
    const { categories, questions } = req.body;
    try {
        const db = await openDb();
        await db.run('BEGIN TRANSACTION');

        // Clear existing
        await db.run('DELETE FROM questions');
        await db.run('DELETE FROM categories');

        for (const cat of categories) {
            await db.run('INSERT INTO categories (id, name) VALUES (?, ?)', [cat.id, cat.name]);
        }

        for (const q of questions) {
            await db.run(
                'INSERT INTO questions (id, category_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [q.id, q.category_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation]
            );
        }

        await db.run('COMMIT');
        res.json({ message: 'Import successful' });
    } catch (err) {
        await db.run('ROLLBACK');
        res.status(500).json({ error: 'Import failed' });
    }
});

export default router;
