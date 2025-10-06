const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database/database.db');

class Database{
    constructor(){
        this.db = new sqlite3.Database(dbPath);
    }

    getConnection(){
        return this.db;
    }

    close(){
        return new Promise((resolve, reject) =>{
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            })
        })
    }
}

module.exports = new Database();