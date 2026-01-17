const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { initDatabase, query, queryOne, run, getLastInsertId } = require('./src/database/db-helper');
const { createTables, insertSampleData } = require('./src/database/init-db');

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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/groups/:id', (req, res) => {
    try {
        const { id } = req.params;
        const row = queryOne('SELECT * FROM groups WHERE id = ?', [id]);
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/groups', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Название группы обязательно' });
        
        run('INSERT INTO groups (name) VALUES (?)', [name]);
        const id = getLastInsertId();
        res.status(201).json({ id, name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/groups/:id', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Название группы обязательно' });
        
        run('UPDATE groups SET name = ? WHERE id = ?', [name, req.params.id]);
        res.json({ id: req.params.id, name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/groups/:id', (req, res) => {
    try {
        run('DELETE FROM groups WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ---------- TEACHERS ----------
app.get('/api/teachers', (req, res) => {
    try {
        const rows = query('SELECT * FROM teachers ORDER BY full_name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/teachers/:id', (req, res) => {
    try {
        const { id } = req.params;
        const row = queryOne('SELECT * FROM teachers WHERE id = ?', [id]);
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/teachers', (req, res) => {
    try {
        const { full_name } = req.body;
        if (!full_name) return res.status(400).json({ error: 'ФИО преподавателя обязательно' });
        
        run('INSERT INTO teachers (full_name) VALUES (?)', [full_name]);
        const id = getLastInsertId();
        res.status(201).json({ id, full_name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/teachers/:id', (req, res) => {
    try {
        const { full_name } = req.body;
        if (!full_name) return res.status(400).json({ error: 'ФИО преподавателя обязательно' });
        
        run('UPDATE teachers SET full_name = ? WHERE id = ?', [full_name, req.params.id]);
        res.json({ id: req.params.id, full_name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/teachers/:id', (req, res) => {
    try {
        run('DELETE FROM teachers WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ---------- SUBJECTS ----------
app.get('/api/subjects', (req, res) => {
    try {
        const rows = query('SELECT * FROM subjects ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/subjects/:id', (req, res) => {
    try {
        const { id } = req.params;
        const row = queryOne('SELECT * FROM subjects WHERE id = ?', [id]);
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/subjects', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Название дисциплины обязательно' });
        
        run('INSERT INTO subjects (name) VALUES (?)', [name]);
        const id = getLastInsertId();
        res.status(201).json({ id, name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/subjects/:id', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Название дисциплины обязательно' });
        
        run('UPDATE subjects SET name = ? WHERE id = ?', [name, req.params.id]);
        res.json({ id: req.params.id, name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/subjects/:id', (req, res) => {
    try {
        run('DELETE FROM subjects WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ---------- CLASSROOMS ----------
app.get('/api/classrooms', (req, res) => {
    try {
        const rows = query('SELECT * FROM classrooms ORDER BY room_number');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/classrooms/:id', (req, res) => {
    try {
        const { id } = req.params;
        const row = queryOne('SELECT * FROM classrooms WHERE id = ?', [id]);
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/classrooms', (req, res) => {
    try {
        const { room_number } = req.body;
        if (!room_number) return res.status(400).json({ error: 'Номер аудитории обязателен' });
        
        run('INSERT INTO classrooms (room_number) VALUES (?)', [room_number]);
        const id = getLastInsertId();
        res.status(201).json({ id, room_number });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/classrooms/:id', (req, res) => {
    try {
        const { room_number } = req.body;
        if (!room_number) return res.status(400).json({ error: 'Номер аудитории обязателен' });
        
        run('UPDATE classrooms SET room_number = ? WHERE id = ?', [room_number, req.params.id]);
        res.json({ id: req.params.id, room_number });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/classrooms/:id', (req, res) => {
    try {
        run('DELETE FROM classrooms WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ---------- SCHEDULE ----------
app.get('/api/schedule', (req, res) => {
    try {
        let sql = `
            SELECT s.id, s.day_of_week, s.lesson_number, 
                   g.name as group_name, g.id as group_id,
                   sub.name as subject_name, sub.id as subject_id,
                   t.full_name as teacher_name, t.id as teacher_id,
                   c.room_number as classroom_number, c.id as classroom_id
            FROM schedule s
            JOIN groups g ON s.group_id = g.id
            JOIN subjects sub ON s.subject_id = sub.id
            JOIN teachers t ON s.teacher_id = t.id
            JOIN classrooms c ON s.classroom_id = c.id
        `;
        
        const where = [];
        const params = [];
        
        if (req.query.group_id) {
            where.push('s.group_id = ?');
            params.push(req.query.group_id);
        }
        if (req.query.day_of_week) {
            where.push('s.day_of_week = ?');
            params.push(req.query.day_of_week);
        }
        
        if (where.length > 0) {
            sql += ' WHERE ' + where.join(' AND ');
        }
        
        sql += ' ORDER BY s.day_of_week, s.lesson_number';
        
        const rows = query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/schedule', (req, res) => {
    try {
        const { group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number } = req.body;
        
        run(
            'INSERT INTO schedule (group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number) VALUES (?, ?, ?, ?, ?, ?)',
            [group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number]
        );
        const id = getLastInsertId();
        res.status(201).json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/schedule/:id', (req, res) => {
    try {
        const { group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number } = req.body;
        
        run(
            'UPDATE schedule SET group_id = ?, subject_id = ?, teacher_id = ?, classroom_id = ?, day_of_week = ?, lesson_number = ? WHERE id = ?',
            [group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number, req.params.id]
        );
        res.json({ id: req.params.id, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/schedule/:id', (req, res) => {
    try {
        run('DELETE FROM schedule WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== Server Start ====================

async function startServer() {
    await initDatabase();

    // Проверяем, существуют ли таблицы. Если нет, создаем и заполняем их.
    try {
        queryOne('SELECT id FROM groups LIMIT 1');
    } catch (e) {
        console.log('База данных пуста, инициализация...');
        createTables();
        insertSampleData();
        console.log('База данных успешно инициализирована.');
    }

    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
        console.log(`Откройте http://localhost:${PORT} в браузере`);
    });
}

startServer().catch(error => {
    console.error('Критическая ошибка при запуске сервера:', error);
    process.exit(1);
});
