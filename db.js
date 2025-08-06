const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'data.db'));

// เพิ่มบรรทัดนี้!
// ตั้งค่าให้รอสูงสุด 5 วินาที (5000ms) หากฐานข้อมูลไม่ว่าง
db.pragma('busy_timeout = 5000');
db.pragma('journal_mode = WAL');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS room (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room TEXT,
      name TEXT,
      phone TEXT,
      check_in TEXT,
      check_out TEXT,
      count INTEGER,
      pay_status BOOLEAN,
      note TEXT,
      staff INTEGER,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS setting (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      logo1 TEXT,
      logo2 TEXT,
      start TEXT,
      end INTEGER
    );

    CREATE TABLE IF NOT EXISTS member (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT
    );
  `)
}

initDatabase()

module.exports = db
