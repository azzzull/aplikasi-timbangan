const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor(dbPath) {
        // Untuk IoT device, bisa gunakan in-memory database jika diperlukan
        if (dbPath === ':memory:') {
            this.db = new sqlite3.Database(':memory:', (err) => {
                if (err) {
                    console.error('Error opening in-memory database:', err.message);
                } else {
                    console.log('Connected to in-memory SQLite database');
                    this.initializeTables();
                }
            });
        } else {
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
    }

    initializeTables() {
        // Schema minimal untuk IoT device
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS weights (
                id INTEGER PRIMARY KEY,
                scaleId TEXT UNIQUE,
                itemCode TEXT,
                itemName TEXT,
                weight REAL,
                location TEXT,
                datetime TEXT
            )
        `;

        this.db.run(createTableSQL, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Weights table ready');
                // Optimasi untuk IoT device - limit jumlah record
                this.db.run(`
                    CREATE TRIGGER IF NOT EXISTS limit_records 
                    AFTER INSERT ON weights 
                    WHEN (SELECT COUNT(*) FROM weights) > 100 
                    BEGIN 
                        DELETE FROM weights WHERE id = (SELECT MIN(id) FROM weights);
                    END
                `, (triggerErr) => {
                    if (triggerErr) {
                        console.log('Note: Could not create limit trigger (optional optimization)');
                    } else {
                        console.log('Auto-cleanup trigger enabled (max 100 records)');
                    }
                });
            }
        });
    }

    // Simpan data baru - optimized for IoT
    saveWeight(data) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO weights (scaleId, itemCode, itemName, weight, location, datetime) VALUES (?, ?, ?, ?, ?, ?)`;
            
            this.db.run(sql, [
                data.scaleId,
                data.itemCode || '',
                data.itemName || '',
                data.weight,
                data.location || '',
                data.datetime
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...data });
                }
            });
        });
    }

    // Ambil data terbatas untuk IoT device
    getAllWeights(limit = 50) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM weights ORDER BY id DESC LIMIT ?';
            
            this.db.all(sql, [limit], (err, rows) => {
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
