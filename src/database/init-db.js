const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Путь к файлу базы данных
const dbPath = path.join(__dirname, '../../database.db');

let db;

async function initDatabase() {
    const SQL = await initSqlJs();
    
    // Попытка загрузить существующую базу данных
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }
    
    console.log('Подключение к базе данных SQLite установлено.');
    
    // Включение внешних ключей
    db.run('PRAGMA foreign_keys = ON');
    
    return db;
}

// SQL-запросы для создания таблиц
const createTables = () => {
    // Создание таблицы групп
    db.exec(`
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    `);
    console.log('Таблица groups создана.');

    // Создание таблицы преподавателей
    db.exec(`
        CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL
        )
    `);
    console.log('Таблица teachers создана.');

    // Создание таблицы дисциплин
    db.exec(`
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    `);
    console.log('Таблица subjects создана.');

    // Создание таблицы аудиторий
    db.exec(`
        CREATE TABLE IF NOT EXISTS classrooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_number TEXT NOT NULL UNIQUE
        )
    `);
    console.log('Таблица classrooms создана.');

    // Создание таблицы расписания
    db.exec(`
        CREATE TABLE IF NOT EXISTS schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            subject_id INTEGER NOT NULL,
            teacher_id INTEGER NOT NULL,
            classroom_id INTEGER NOT NULL,
            day_of_week TEXT NOT NULL,
            lesson_number INTEGER NOT NULL,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
            FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
            CHECK (lesson_number >= 1 AND lesson_number <= 8),
            CHECK (day_of_week IN ('Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота')),
            UNIQUE(group_id, day_of_week, lesson_number),
            UNIQUE(teacher_id, day_of_week, lesson_number),
            UNIQUE(classroom_id, day_of_week, lesson_number)
        )
    `);
    console.log('Таблица schedule создана.');
};

// Функция для добавления примера данных
const insertSampleData = () => {
    // Примеры групп
    const groups = ['ИВТ-21', 'ИВТ-22', 'ПИ-21', 'ИСТ-21'];
    const teachers = [
        'Иванов Иван Иванович',
        'Петров Петр Петрович',
        'Сидорова Мария Александровна',
        'Козлов Алексей Викторович'
    ];
    const subjects = [
        'Математический анализ',
        'Программирование',
        'Базы данных',
        'Операционные системы',
        'Компьютерные сети',
        'Веб-разработка'
    ];
    const classrooms = ['101', '102', '201', '202', '301', '302'];

    // Вставка данных
    groups.forEach(group => {
        db.run('INSERT OR IGNORE INTO groups (name) VALUES (?)', [group]);
    });
    teachers.forEach(teacher => {
        db.run('INSERT OR IGNORE INTO teachers (full_name) VALUES (?)', [teacher]);
    });
    subjects.forEach(subject => {
        db.run('INSERT OR IGNORE INTO subjects (name) VALUES (?)', [subject]);
    });
    classrooms.forEach(classroom => {
        db.run('INSERT OR IGNORE INTO classrooms (room_number) VALUES (?)', [classroom]);
    });

    console.log('Примеры данных добавлены.');
};

// Запуск создания таблиц
async function main() {
    try {
        await initDatabase();
        createTables();
        insertSampleData();
        
        // Сохранение базы данных в файл
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
        
        console.log('База данных успешно инициализирована и сохранена!');
    } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
    } finally {
        if (db) {
            db.close();
            console.log('Соединение с базой данных закрыто.');
        }
    }
}

main();
