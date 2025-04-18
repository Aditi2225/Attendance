// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// // Go one level up from "server" and look for database.sqlite
// const dbPath = path.join(__dirname, '..', 'database.sqlite');

// const db = new sqlite3.Database(dbPath, (err) => {
//     if (err) {
//         console.error('Failed to connect to database:', err.message);
//     } else {
//         console.log('Connected to the database.');
//     }
// });

// module.exports = db;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Resolve the path to one level above the server folder
const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

module.exports = db;
