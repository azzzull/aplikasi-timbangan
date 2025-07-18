const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor(dbPath) {
        // Pastikan direktori database ada
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database');
                this.initializeTables();
            }
        });
    }

    initializeTables() {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS weights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scaleId TEXT UNIQUE NOT NULL,
                itemCode TEXT NOT NULL,
                itemName TEXT NOT NULL,
                weight REAL NOT NULL,
                location TEXT NOT NULL,
                datetime TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.run(createTableSQL, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Weights table ready');
            }
        });
    }

    // Simpan data baru
    saveWeight(data) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO weights (scaleId, itemCode, itemName, weight, location, datetime)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                data.scaleId,
                data.itemCode,
                data.itemName,
                data.weight,
                data.location,
                data.datetime
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        ...data
                    });
                }
            });
        });
    }

    // Ambil semua data
    getAllWeights() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM weights ORDER BY createdAt DESC';
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Tutup koneksi database
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        });
    }
}

module.exports = Database;
