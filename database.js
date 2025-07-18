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
                date TEXT NOT NULL,
                time TEXT NOT NULL,
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
                INSERT INTO weights (scaleId, itemCode, itemName, weight, location, date, time)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                data.scaleId,
                data.itemCode,
                data.itemName,
                data.weight,
                data.location,
                data.date,
                data.time
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

    // Update nama barang berdasarkan scaleId
    updateItemName(scaleId, newItemName) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE weights SET itemName = ? WHERE scaleId = ?';
            
            this.db.run(sql, [newItemName, scaleId], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Data tidak ditemukan'));
                } else {
                    // Ambil data yang sudah diupdate
                    const selectSQL = 'SELECT * FROM weights WHERE scaleId = ?';
                    this.db.get(selectSQL, [scaleId], (err, row) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                }
            });
        });
    }

    // Hapus data berdasarkan scaleId
    deleteWeight(scaleId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM weights WHERE scaleId = ?';
            
            this.db.run(sql, [scaleId], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Data tidak ditemukan'));
                } else {
                    resolve({ message: 'Data berhasil dihapus', deletedCount: this.changes });
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
