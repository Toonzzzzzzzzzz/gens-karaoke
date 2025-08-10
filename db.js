const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

// Get the user data path
const userDataPath = app.getPath('userData');
// Ensure the directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}
const dbPath = path.join(userDataPath, 'data.db');

function _saveDatabase(dbInstance) {
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

class Statement {
  constructor(stmt, db, sql) {
    this.stmt = stmt;
    this.db = db;
    this.sql = sql;
  }

  get(...params) {
    this.stmt.bind(params);
    let result = null;
    if (this.stmt.step()) {
      result = this.stmt.getAsObject();
    }
    this.stmt.free();
    return result;
  }

  all(...params) {
    this.stmt.bind(params);
    const results = [];
    while (this.stmt.step()) {
      results.push(this.stmt.getAsObject());
    }
    this.stmt.free();
    return results;
  }

  run(...params) {
    this.stmt.run(params);
    this.stmt.free();

    let lastId = null;
    if (this.sql.trim().toUpperCase().startsWith('INSERT')) {
      const idStmt = this.db.prepare('SELECT last_insert_rowid() as id');
      if (idStmt.step()) {
        lastId = idStmt.getAsObject().id;
      }
      idStmt.free();
    }
    return { changes: this.db.getRowsModified(), lastInsertRowid: lastId };
  }
}

class Database {
  constructor(db) {
    this.db = db;
  }

  prepare(sql) {
    const stmt = this.db.prepare(sql);
    return new Statement(stmt, this.db, sql);
  }

  exec(sql) {
    this.db.exec(sql);
  }

  pragma() {
    return;
  }

  transaction(fn) {
    return (...args) => {
      this.db.exec('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        this.db.exec('COMMIT');
        return result;
      } catch (err) {
        this.db.exec('ROLLBACK');
        throw err;
      }
    };
  }
}

function initDatabase(db) {
  const { key_id } = require('./config');
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
  `);

  const settingRow = db.prepare('SELECT COUNT(*) as count FROM setting').get();
  if (settingRow.count === 0) {
    const stmt = db.prepare(
      `INSERT INTO setting (key_id, name, address, start, end) VALUES (?, ?, ?, ?, ?)`
    );
    stmt.run(key_id, 'ชื่อร้าน', 'ที่อยู่', '00:00', '23:59');
  }

  const roomRow = db.prepare('SELECT COUNT(*) as count FROM room').get();
  if (roomRow.count === 0) {
    const insert = db.prepare('INSERT INTO room (name) VALUES (?)');
    const rooms = ['Room 1'];
    for (const room of rooms) {
      insert.run(room);
    }
  }

  const staffRow = db.prepare('SELECT COUNT(*) as count FROM staff').get();
  if (staffRow.count === 0) {
    db.prepare(
      `INSERT INTO staff (name, phone) VALUES (?, ?)`
    ).run('Default Staff', '0000000000');
  }
  // After init, save once
  _saveDatabase(db.db); 
}

async function initializeDb() {
  const SQL = await initSqlJs();
  let dbInstance;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  const dbWrapper = new Database(dbInstance);
  
  const checkTable = dbWrapper.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='setting'").get();
  if (!checkTable) {
    console.log('Initializing database schema and default data...');
    initDatabase(dbWrapper);
  }

  return {
    db: dbWrapper,
    saveDatabase: () => _saveDatabase(dbInstance)
  };
}

module.exports = initializeDb();
