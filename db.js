// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./egg_prices.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS prices (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              date TEXT NOT NULL,
                                              type TEXT NOT NULL,
                                              region TEXT NOT NULL,
                                              price REAL NOT NULL
        )
    `);
});

module.exports = db;
