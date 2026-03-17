import { Router } from 'express';
import { supabase } from '../db/database';

const router = Router();

// Categories
router.get('/categories', async (req, res) => {
    const { student_id } = req.query;

    if (student_id) {
        // Fetch categories joined with assignments for this student
        const { data, error } = await supabase
            .from('student_category_assignments')
            .select('category_id, end_date, categories(*)')
            .eq('student_id', student_id)
            .gte('end_date', new Date().toISOString());

        if (error) return res.status(500).json(error);
        
        // Extract categories and include end_date if needed
        const categories = (data || []).filter(assignment => assignment.categories).map((assignment: any) => ({
            ...assignment.categories,
            assignment_end_date: assignment.end_date
        }));
        
        return res.json(categories);
    } else {
        // Normal fetch for admin
        const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
        if (error) return res.status(500).json(error);
        res.json(data);
    }
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
    let query = supabase.from('questions').select('*').order('id', { ascending: true });
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

// Student Assignments
router.get('/students/:id/assignments', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('student_category_assignments')
        .select('*, categories(*)')
        .eq('student_id', id);

    if (error) return res.status(500).json(error);
    res.json(data);
});

router.post('/students/:id/assignments', async (req, res) => {
    const { id } = req.params;
    const { category_id, duration_days } = req.body;
    
    const end_date = new Date();
    end_date.setDate(end_date.getDate() + parseInt(duration_days || 30));

    const { data, error } = await supabase
        .from('student_category_assignments')
        .insert([{
            student_id: id,
            category_id,
            end_date: end_date.toISOString()
        }])
        .select('*, categories(*)');

    if (error) return res.status(500).json(error);
    res.status(201).json(data ? data[0] : null);
});

router.delete('/students/assignments/:assignment_id', async (req, res) => {
    const { assignment_id } = req.params;
    const { error } = await supabase
        .from('student_category_assignments')
        .delete()
        .eq('id', assignment_id);

    if (error) return res.status(500).json(error);
    res.status(204).send();
});

// Unified Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const trimmedUsername = username?.trim();

    // 1. Try Admin Login
    const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('username', trimmedUsername)
        .single();

    if (!adminError && admin) {
        if (admin.password === password) {
            return res.json({
                success: true,
                userType: 'admin',
                role: admin.role || 'admin',
                username: admin.username,
                permissions: {
                    can_add_questions: admin.can_add_questions ?? true,
                    can_edit_questions: admin.can_edit_questions ?? true,
                    can_delete_questions: admin.can_delete_questions ?? true,
                    can_view_stats: admin.can_view_stats ?? true,
                    can_manage_admins: admin.can_manage_admins ?? (admin.role === 'superadmin')
                }
            });
        } else {
            return res.status(401).json({ error: 'Hatalı şifre' });
        }
    }

    // 2. Try Student Login
    const { data: students, error: studentError } = await supabase
        .from('students')
        .select('*')
        .ilike('name', trimmedUsername);

    const student = students && students.length > 0 ? students[0] : null;

    if (!studentError && student) {
        if (student.password === password) {
            // Check expiry
            if (student.expires_at && new Date(student.expires_at) < new Date()) {
                return res.status(403).json({ error: 'Erişim süreniz dolmuş' });
            }
            return res.json({
                success: true,
                userType: 'student',
                username: student.name,
                student_id: student.id,
                role: 'student'
            });
        } else {
            return res.status(401).json({ error: 'Hatalı şifre' });
        }
    }

    // 3. Fallback for first-time superadmin/admin if tables are empty/migrating
    if (trimmedUsername === 'superadmin' && password === '0142753869') {
        const { error: insertError } = await supabase
            .from('admins')
            .insert([{ username: 'superadmin', password: '0142753869', role: 'superadmin', can_manage_admins: true }]);

        if (!insertError || insertError.code === '23505') { // 23505 is unique violation
            return res.json({
                success: true,
                userType: 'admin',
                role: 'superadmin',
                username: 'superadmin',
                permissions: { can_add_questions: true, can_edit_questions: true, can_delete_questions: true, can_view_stats: true, can_manage_admins: true }
            });
        }
    }

    if (trimmedUsername === 'admin' && password === 'admin123') {
        const { error: insertError } = await supabase
            .from('admins')
            .insert([{ username: 'admin', password: 'admin123', role: 'admin' }]);

        if (!insertError || insertError.code === '23505') {
            return res.json({
                success: true,
                userType: 'admin',
                role: 'admin',
                username: 'admin',
                permissions: { can_add_questions: true, can_edit_questions: true, can_delete_questions: true, can_view_stats: true, can_manage_admins: false }
            });
        }
    }

    res.status(401).json({ error: 'Hatalı kullanıcı adı veya şifre' });
});

// Admin User Management
router.get('/admin/users', async (req, res) => {
    const { data, error } = await supabase.from('admins').select('id, username, role, can_add_questions, can_edit_questions, can_delete_questions, can_view_stats, can_manage_admins').order('id', { ascending: true });
    if (error) return res.status(500).json(error);
    res.json(data);
});

router.post('/admin/users', async (req, res) => {
    const { username, password, role, can_add_questions, can_edit_questions, can_delete_questions, can_view_stats, can_manage_admins } = req.body;
    const { data, error } = await supabase.from('admins').insert([{
        username, password, role: role || 'admin',
        can_add_questions: can_add_questions ?? true,
        can_edit_questions: can_edit_questions ?? true,
        can_delete_questions: can_delete_questions ?? true,
        can_view_stats: can_view_stats ?? true,
        can_manage_admins: can_manage_admins ?? false
    }]).select();

    if (error) return res.status(500).json(error);
    res.status(201).json(data[0]);
});

router.put('/admin/users/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('admins').update(req.body).eq('id', id).select();
    if (error) return res.status(500).json(error);
    res.json(data[0]);
});

router.delete('/admin/users/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('admins').delete().eq('id', id);
    if (error) return res.status(500).json(error);
    res.status(204).send();
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

router.get('/admin/student-stats', async (req, res) => {
    const { data, error } = await supabase
        .from('student_results')
        .select('*, categories(name)')
        .order('completed_at', { ascending: false });

    if (error) return res.status(500).json(error);
    res.json(data);
});

router.post('/results', async (req, res) => {
    const { student_name, category_id, score, total, wrong_questions } = req.body;
    const { data, error } = await supabase.from('student_results').insert([{
        student_name, category_id, score, total, wrong_questions: wrong_questions || []
    }]).select();

    if (error) return res.status(500).json(error);
    res.status(201).json(data[0]);
});

export default router;
