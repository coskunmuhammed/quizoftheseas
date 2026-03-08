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
    const { name, parent_id } = req.body;
    const { data, error } = await supabase.from('categories').insert([{ name, parent_id }]).select();
    if (error) return res.status(500).json(error);
    res.status(201).json(data[0]);
});

router.put('/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const { data, error } = await supabase.from('categories').update({ name }).eq('id', id).select();
    if (error) return res.status(500).json(error);
    res.json(data[0]);
});

router.delete('/categories/:id', async (req, res) => {
    const { id } = req.params;

    // First delete all questions in this category to avoid foreign key issues
    const { error: qError } = await supabase.from('questions').delete().eq('category_id', id);
    if (qError) return res.status(500).json(qError);

    // Then delete the category
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return res.status(500).json(error);

    res.status(204).send();
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

router.put('/questions/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('questions').update(req.body).eq('id', id).select();
    if (error) return res.status(500).json(error);
    res.json(data[0]);
});

router.delete('/questions/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) return res.status(500).json(error);
    res.status(204).send();
});

// Students
router.get('/students', async (req, res) => {
    const { data, error } = await supabase.from('students').select('*').order('id', { ascending: true });
    if (error) return res.status(500).json(error);
    res.json(data);
});

router.post('/students', async (req, res) => {
    const { data, error } = await supabase.from('students').insert([req.body]).select();
    if (error) return res.status(500).json(error);
    res.status(201).json(data[0]);
});

router.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) return res.status(500).json(error);
    res.status(204).send();
});

// Admin Auth
router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    // In a real app, we'd use a better auth system, but for this architecture
    // we check a dedicated 'admins' table or just use existing logic if simpler.
    // The user requested a system to change password, implying it should be persistent.

    const { data: admin, error } = await supabase
        .from('admins')
        .select('id, username, password, role')
        .eq('username', username)
        .single();

    if (error || !admin) {
        // Fallback for first time if table doesn't exist or empty
        if (username === 'superadmin' && password === '0142753869') {
            const { error: insertError } = await supabase
                .from('admins')
                .insert([{ username: 'superadmin', password: '0142753869', role: 'superadmin' }]);

            if (!insertError) {
                return res.json({ success: true, message: 'Hoş geldiniz, Süper Admin! (İlk kurulum tamamlandı)', role: 'superadmin' });
            }
        }

        if (username === 'admin' && password === 'admin123') {
            const { error: insertError } = await supabase
                .from('admins')
                .insert([{ username: 'admin', password: 'admin123', role: 'admin' }]);

            if (!insertError) {
                return res.json({ success: true, message: 'Hoş geldiniz, Hocam! (İlk kurulum tamamlandı)', role: 'admin' });
            }
        }
        return res.status(401).json({ error: 'Hatalı kullanıcı adı veya şifre' });
    }

    if (admin.password === password) {
        res.json({ success: true, role: admin.role || 'admin' });
    } else {
        res.status(401).json({ error: 'Hatalı şifre' });
    }
});

router.post('/admin/change-password', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !admin || admin.password !== currentPassword) {
        return res.status(401).json({ error: 'Mevcut şifre hatalı' });
    }

    const { error: updateError } = await supabase
        .from('admins')
        .update({ password: newPassword })
        .eq('username', username);

    if (updateError) return res.status(500).json(updateError);

    res.json({ success: true, message: 'Şifre başarıyla güncellendi' });
});

// Results
router.get('/results', async (req, res) => {
    const { student_name } = req.query;
    let query = supabase.from('student_results').select('*, categories(name)').order('completed_at', { ascending: false });
    if (student_name) query = query.eq('student_name', student_name);

    const { data, error } = await query;
    if (error) return res.status(500).json(error);
    res.json(data);
});

router.post('/results', async (req, res) => {
    const { student_name, category_id, score, total } = req.body;
    const { data, error } = await supabase.from('student_results').insert([{
        student_name, category_id, score, total
    }]).select();

    if (error) return res.status(500).json(error);
    res.status(201).json(data[0]);
});

export default router;
