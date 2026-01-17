const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { initDatabase, query, queryOne, run, getLastInsertId } = require('./src/database/db-helper');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Настраиваем CORS для разрешения запросов с любого источника
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== API Routes ====================

// ---------- GROUPS ----------
app.get('/api/groups', (req, res) => {
    try {
        const rows = query('SELECT * FROM groups ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/groups/:id', (req, res) => {
    try {
        const { id } = req.params;
        const row = queryOne('SELECT * FROM groups WHERE id = ?', [id]);
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/groups', (req, res) => {
    try {
        const { name } = req.body;
        run('INSERT INTO groups (name) VALUES (?)', [name]);
        const id = getLastInsertId();
        res.json({ id, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/groups/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        run('UPDATE groups SET name = ? WHERE id = ?', [name, id]);
        res.json({ id, name, changes: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/groups/:id', (req, res) => {
    try {
        const { id } = req.params;
        run('DELETE FROM groups WHERE id = ?', [id]);
        res.json({ deleted: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------- TEACHERS ----------
app.get('/api/teachers', (req, res) => {
    try {
        const rows = query('SELECT * FROM teachers ORDER BY full_name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/teachers/:id', (req, res) => {
    try {
        const { id } = req.params;
        const row = queryOne('SELECT * FROM teachers WHERE id = ?', [id]);
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/teachers', (req, res) => {
    try {
        const { full_name } = req.body;
        run('INSERT INTO teachers (full_name) VALUES (?)', [full_name]);
        const id = getLastInsertId();
        res.json({ id, full_name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/teachers/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { full_name } = req.body;
        run('UPDATE teachers SET full_name = ? WHERE id = ?', [full_name, id]);
        res.json({ id, full_name, changes: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/teachers/:id', (req, res) => {
    try {
        const { id } = req.params;
        run('DELETE FROM teachers WHERE id = ?', [id]);
        res.json({ deleted: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------- SUBJECTS ----------
app.get('/api/subjects', (req, res) => {
    try {
        const rows = query('SELECT * FROM subjects ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/subjects/:id', (req, res) => {
    try {
        const { id } = req.params;
        const row = queryOne('SELECT * FROM subjects WHERE id = ?', [id]);
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/subjects', (req, res) => {
    try {
        const { name } = req.body;
        run('INSERT INTO subjects (name) VALUES (?)', [name]);
        const id = getLastInsertId();
        res.json({ id, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/subjects/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        run('UPDATE subjects SET name = ? WHERE id = ?', [name, id]);
        res.json({ id, name, changes: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/subjects/:id', (req, res) => {
    try {
        const { id } = req.params;
        run('DELETE FROM subjects WHERE id = ?', [id]);
        res.json({ deleted: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------- CLASSROOMS ----------
app.get('/api/classrooms', (req, res) => {
    try {
        const rows = query('SELECT * FROM classrooms ORDER BY room_number');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/classrooms/:id', (req, res) => {
    try {
        const { id } = req.params;
        const row = queryOne('SELECT * FROM classrooms WHERE id = ?', [id]);
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/classrooms', (req, res) => {
    try {
        const { room_number } = req.body;
        run('INSERT INTO classrooms (room_number) VALUES (?)', [room_number]);
        const id = getLastInsertId();
        res.json({ id, room_number });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/classrooms/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { room_number } = req.body;
        run('UPDATE classrooms SET room_number = ? WHERE id = ?', [room_number, id]);
        res.json({ id, room_number, changes: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/classrooms/:id', (req, res) => {
    try {
        const { id } = req.params;
        run('DELETE FROM classrooms WHERE id = ?', [id]);
        res.json({ deleted: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------- SCHEDULE ----------
app.get('/api/schedule', (req, res) => {
    try {
        const { group_id, day_of_week } = req.query;
        let sql = `
            SELECT 
                s.id,
                s.day_of_week,
                s.lesson_number,
                g.name as group_name,
                g.id as group_id,
                sub.name as subject_name,
                sub.id as subject_id,
                t.full_name as teacher_name,
                t.id as teacher_id,
                c.room_number as classroom_number,
                c.id as classroom_id
            FROM schedule s
            JOIN groups g ON s.group_id = g.id
            JOIN subjects sub ON s.subject_id = sub.id
            JOIN teachers t ON s.teacher_id = t.id
            JOIN classrooms c ON s.classroom_id = c.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (group_id) {
            sql += ' AND s.group_id = ?';
            params.push(group_id);
        }
        
        if (day_of_week) {
            sql += ' AND s.day_of_week = ?';
            params.push(day_of_week);
        }
        
        sql += ' ORDER BY s.day_of_week, s.lesson_number';
        
        const rows = query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/schedule', (req, res) => {
    try {
        const { group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number } = req.body;
        
        run(
            `INSERT INTO schedule (group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number]
        );
        
        const id = getLastInsertId();
        
        res.json({ 
            id,
            group_id,
            subject_id,
            teacher_id,
            classroom_id,
            day_of_week,
            lesson_number
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/schedule/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number } = req.body;
        
        run(
            `UPDATE schedule 
             SET group_id = ?, subject_id = ?, teacher_id = ?, classroom_id = ?, day_of_week = ?, lesson_number = ?
             WHERE id = ?`,
            [group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number, id]
        );
        
        res.json({ 
            id,
            group_id,
            subject_id,
            teacher_id,
            classroom_id,
            day_of_week,
            lesson_number,
            changes: 1
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/schedule/:id', (req, res) => {
    try {
        const { id } = req.params;
        run('DELETE FROM schedule WHERE id = ?', [id]);
        res.json({ deleted: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
        console.log(`Откройте http://localhost:${PORT} в браузере`);
    });
}).catch(err => {
    console.error('Ошибка инициализации базы данных:', err);
    process.exit(1);
});
