import { Router } from 'express';
import { supabase } from '../db/database';

const router = Router();

// Categories
router.get('/categories', async (req, res) => {
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) return res.status(500).json(error);
    res.json(data);
});

router.post('/categories', async (req, res) => {
    const { name } = req.body;
    const { data, error } = await supabase.from('categories').insert([{ name }]).select();
    if (error) return res.status(500).json(error);
    res.status(201).json(data[0]);
});

// Questions
router.get('/questions', async (req, res) => {
    const { category_id } = req.query;
    let query = supabase.from('questions').select('*');
    if (category_id) query = query.eq('category_id', category_id);

    const { data, error } = await query;
    if (error) return res.status(500).json(error);
    res.json(data);
});

router.post('/questions', async (req, res) => {
    const { data, error } = await supabase.from('questions').insert([req.body]).select();
    if (error) return res.status(500).json(error);
    res.status(201).json(data[0]);
});

export default router;
