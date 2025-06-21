const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Настройка подключения к PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'time_tracking_db',
    password: 'Sasha100.', 
    port: 5432,
});

// Роуты для проектов
app.get('/api/projects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/projects', async (req, res) => {
    const { name, description, is_active } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO projects (name, description, is_active) VALUES ($1, $2, $3) RETURNING *',
            [name, description, is_active]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    try {
        const result = await pool.query(
            'UPDATE projects SET name = $1, description = $2, is_active = $3 WHERE id = $4 RETURNING *',
            [name, description, is_active, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        res.json({ message: 'Проект удален' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Роуты для задач
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT t.*, p.name as project_name FROM tasks t JOIN projects p ON t.project_id = p.id ORDER BY t.id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { name, project_id, is_active } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (name, project_id, is_active) VALUES ($1, $2, $3) RETURNING *',
            [name, project_id, is_active]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { name, project_id, is_active } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tasks SET name = $1, project_id = $2, is_active = $3 WHERE id = $4 RETURNING *',
            [name, project_id, is_active, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ message: 'Задача удалена' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Роуты для проводок времени
app.get('/api/time-entries', async (req, res) => {
    const { date, month } = req.query;
    let query = 'SELECT te.*, t.name as task_name, p.name as project_name FROM time_entries te JOIN tasks t ON te.task_id = t.id JOIN projects p ON t.project_id = p.id';

    if (date) {
        query += ` WHERE te.entry_date = '${date}'`;
    } else if (month) {
        query += ` WHERE to_char(te.entry_date, 'YYYY-MM') = '${month}'`;
    }

    query += ' ORDER BY te.entry_date DESC';

    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/time-entries', async (req, res) => {
    const { entry_date, hours, description, task_id } = req.body;
    
    try {
        // Проверка на превышение 24 часов в день
        const totalHoursResult = await pool.query(
            'SELECT SUM(hours) as total FROM time_entries WHERE entry_date = $1',
            [entry_date]
        );
        const totalHours = parseFloat(totalHoursResult.rows[0].total) || 0;
        
        if (totalHours + hours > 24) {
            return res.status(400).json({ error: 'Превышено максимальное количество часов за день (24)' });
        }

        // Проверка активности задачи
        const taskResult = await pool.query('SELECT is_active FROM tasks WHERE id = $1', [task_id]);
        if (taskResult.rows.length === 0 || !taskResult.rows[0].is_active) {
            return res.status(400).json({ error: 'Нельзя добавить время для неактивной задачи' });
        }

        const result = await pool.query(
            'INSERT INTO time_entries (entry_date, hours, description, task_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [entry_date, hours, description, task_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/time-entries/:id', async (req, res) => {
    const { id } = req.params;
    const { entry_date, hours, description, task_id } = req.body;
    
    try {
        // Проверка активности задачи (если пытаемся изменить задачу)
        if (task_id) {
            const originalEntry = await pool.query('SELECT task_id FROM time_entries WHERE id = $1', [id]);
            if (originalEntry.rows[0].task_id !== task_id) {
                const taskResult = await pool.query('SELECT is_active FROM tasks WHERE id = $1', [task_id]);
                if (taskResult.rows.length === 0 || !taskResult.rows[0].is_active) {
                    return res.status(400).json({ error: 'Нельзя изменить на неактивную задачу' });
                }
            }
        }

        // Проверка на превышение 24 часов в день
        if (entry_date || hours) {
            const currentEntry = await pool.query('SELECT entry_date, hours FROM time_entries WHERE id = $1', [id]);
            const currentDate = entry_date || currentEntry.rows[0].entry_date;
            const currentHours = hours || currentEntry.rows[0].hours;
            
            const totalHoursResult = await pool.query(
                'SELECT SUM(hours) as total FROM time_entries WHERE entry_date = $1 AND id != $2',
                [currentDate, id]
            );
            const totalHours = parseFloat(totalHoursResult.rows[0].total) || 0;
            
            if (totalHours + currentHours > 24) {
                return res.status(400).json({ error: 'Превышено максимальное количество часов за день (24)' });
            }
        }

        const result = await pool.query(
            'UPDATE time_entries SET entry_date = COALESCE($1, entry_date), hours = COALESCE($2, hours), description = COALESCE($3, description), task_id = COALESCE($4, task_id) WHERE id = $5 RETURNING *',
            [entry_date, hours, description, task_id, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/time-entries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM time_entries WHERE id = $1', [id]);
        res.json({ message: 'Проводка удалена' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение суммарного количества часов за день
app.get('/api/daily-hours', async (req, res) => {
    const { date } = req.query;
    try {
        const result = await pool.query(
            'SELECT SUM(hours) as total FROM time_entries WHERE entry_date = $1',
            [date]
        );
        res.json({ total: parseFloat(result.rows[0].total) || 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});