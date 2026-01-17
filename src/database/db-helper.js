const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Render предоставляет доступную для записи директорию в /var/data
// Если переменная окружения RENDER установлена, используем этот путь
const dbPath = process.env.RENDER ? '/var/data/database.db' : path.join(__dirname, '../../database.db');
let db = null;

// Инициализация базы данных
async function initDatabase() {
	const SQL = await initSqlJs();

	if (fs.existsSync(dbPath)) {
		const buffer = fs.readFileSync(dbPath);
		db = new SQL.Database(buffer);
	} else {
		db = new SQL.Database();
	}

	db.run('PRAGMA foreign_keys = ON');
	return db;
}

// Сохранение базы данных
function saveDatabase() {
	if (db) {
		const data = db.export();
		const buffer = Buffer.from(data);
		fs.writeFileSync(dbPath, buffer);
	}
}

// Выполнение SELECT запроса (возвращает массив объектов)
function query(sql, params = []) {
	const result = db.exec(sql, params);
	if (!result[0]) return [];

	const columns = result[0].columns;
	const values = result[0].values;

	return values.map(row => {
		const obj = {};
		columns.forEach((col, i) => {
			obj[col] = row[i];
		});
		return obj;
	});
}

// Выполнение SELECT запроса (возвращает один объект)
function queryOne(sql, params = []) {
	const results = query(sql, params);
	return results.length > 0 ? results[0] : null;
}

// Выполнение INSERT/UPDATE/DELETE
function run(sql, params = []) {
	db.run(sql, params);
	saveDatabase();
}

// Получение последнего вставленного ID
function getLastInsertId() {
	const result = db.exec('SELECT last_insert_rowid()');
	return result[0].values[0][0];
}

// Получение базы данных
function getDb() {
	return db;
}

module.exports = {
	initDatabase,
	saveDatabase,
	query,
	queryOne,
	run,
	getLastInsertId,
	getDb,
};
