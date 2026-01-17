const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Путь к файлу базы данных
const dbPath = path.join(__dirname, '../../database.db');

let db;

const {
	initDatabase,
	getDb,
	query,
	queryOne,
	run,
	saveDatabase,
} = require('./db-helper');

// SQL-запросы для создания таблиц
const createTables = () => {
	const db = getDb();
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
	// Примеры групп (ИИТ, КГТУ)
	const groups = [
		'ПИН(дот)-2-23', // Группа пользователя
		'ИВТ(б)-1-22',
		'УИТС(м)-1-23',
		'ПИ(б)-1-21',
		'Э(б)-2-22',
		'ТС(б)-1-23',
	];

	// Примеры преподавателей (КГТУ)
	const teachers = [
		'Асанов Урмат Асанович',
		'Бакиев Руслан Маратович',
		'Садырова Айгерим Талантовна',
		'Исмаилов Нурлан Болотович',
		'Джумалиева Гульнара Алмазовна',
		'Токтосунов Эмиль Рустамович',
		'Мамырова Жылдыз Кенешбековна',
		'Абдыкадыров Алмаз Болотович',
	];

	// Примеры дисциплин
	const subjects = [
		'Математический анализ',
		'Программирование на Python',
		'Базы данных',
		'Операционные системы',
		'Компьютерные сети',
		'Веб-разработка (Frontend)',
		'Объектно-ориентированное программирование',
		'Дискретная математика',
		'История Кыргызстана',
		'Физическая культура',
	];

	// Примеры аудиторий
	const classrooms = ['1/301', '1/215', '4/101', '5/205', 'Спортзал', '2/404'];

	// Вставка данных
	groups.forEach(group => {
		run('INSERT OR IGNORE INTO groups (name) VALUES (?)', [group]);
	});
	teachers.forEach(teacher => {
		run('INSERT OR IGNORE INTO teachers (full_name) VALUES (?)', [teacher]);
	});
	subjects.forEach(subject => {
		run('INSERT OR IGNORE INTO subjects (name) VALUES (?)', [subject]);
	});
	classrooms.forEach(classroom => {
		run('INSERT OR IGNORE INTO classrooms (room_number) VALUES (?)', [
			classroom,
		]);
	});

	console.log('Примеры данных для справочников добавлены.');

	// Добавление примера расписания для группы ПИН(дот)-2-23
	const scheduleEntries = [
		// Понедельник
		{
			group: 'ПИН(дот)-2-23',
			subject: 'Базы данных',
			teacher: 'Асанов Урмат Асанович',
			classroom: '1/301',
			day: 'Понедельник',
			lesson: 2,
		},
		{
			group: 'ПИН(дот)-2-23',
			subject: 'Программирование на Python',
			teacher: 'Бакиев Руслан Маратович',
			classroom: '4/101',
			day: 'Понедельник',
			lesson: 3,
		},
		// Вторник
		{
			group: 'ПИН(дот)-2-23',
			subject: 'Веб-разработка (Frontend)',
			teacher: 'Садырова Айгерим Талантовна',
			classroom: '5/205',
			day: 'Вторник',
			lesson: 1,
		},
		{
			group: 'ПИН(дот)-2-23',
			subject: 'Физическая культура',
			teacher: 'Абдыкадыров Алмаз Болотович',
			classroom: 'Спортзал',
			day: 'Вторник',
			lesson: 4,
		},
		// Среда
		{
			group: 'ПИН(дот)-2-23',
			subject: 'Базы данных',
			teacher: 'Асанов Урмат Асанович',
			classroom: '1/301',
			day: 'Среда',
			lesson: 1,
			type: 'Лаб',
		}, // Пример с типом
		{
			group: 'ПИН(дот)-2-23',
			subject: 'История Кыргызстана',
			teacher: 'Джумалиева Гульнара Алмазовна',
			classroom: '2/404',
			day: 'Среда',
			lesson: 3,
		},
	];

	scheduleEntries.forEach(entry => {
		const groupId = queryOne('SELECT id FROM groups WHERE name = ?', [
			entry.group,
		])?.id;
		const subjectId = queryOne('SELECT id FROM subjects WHERE name = ?', [
			entry.subject,
		])?.id;
		const teacherId = queryOne('SELECT id FROM teachers WHERE full_name = ?', [
			entry.teacher,
		])?.id;
		const classroomId = queryOne(
			'SELECT id FROM classrooms WHERE room_number = ?',
			[entry.classroom]
		)?.id;

		console.log({ groupId, subjectId, teacherId, classroomId });

		if (groupId && subjectId && teacherId && classroomId) {
			run(
				'INSERT OR IGNORE INTO schedule (group_id, subject_id, teacher_id, classroom_id, day_of_week, lesson_number) VALUES (?, ?, ?, ?, ?, ?)',
				[groupId, subjectId, teacherId, classroomId, entry.day, entry.lesson]
			);
		}
	});

	console.log('Примеры записей для расписания добавлены.');
};

// Запуск создания таблиц
async function main() {
	try {
		await initDatabase();
		createTables();
		insertSampleData();

		// Сохранение базы данных в файл
		saveDatabase();

		console.log('База данных успешно инициализирована и сохранена!');
	} catch (error) {
		console.error('Ошибка при инициализации базы данных:', error);
	} finally {
		const db = getDb();
		if (db) {
			db.close();
			console.log('Соединение с базой данных закрыто.');
		}
	}
}

main();
