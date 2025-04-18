const express = require('express');
const router = express.Router();
const db = require('./db');

let attendanceStartTime = null;
let attendanceTimeLimit = null;

// Faculty starts attendance session
// router.post('/start-attendance', (req, res) => {
//     attendanceStartTime = Date.now(); // Set the start time
//     res.json({ success: true, message: 'Attendance session started' });
// });

router.post('/start-attendance', (req, res) => {
    const { timeLimit } = req.body;

    if (!timeLimit || timeLimit <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid time limit' });
    }

    attendanceStartTime = Date.now();
    attendanceTimeLimit = timeLimit * 60 * 1000; // Convert minutes to milliseconds

    res.json({ success: true, message: `Attendance started for ${timeLimit} minute(s)` });
});

// Mark attendance (Student)
// router.post('/mark-attendance', (req, res) => {
//     const { reg_number } = req.body;
//     const currentTime = Date.now();
//     const date = new Date().toISOString().split('T')[0]; // Get today's date
//     const time = new Date().toISOString().split('T')[1].split('.')[0]; // Get current time

//     if (!attendanceStartTime) {
//         return res.status(400).json({ success: false, message: 'Attendance has not started' });
//     }

//     if (currentTime - attendanceStartTime <= 60000) { // 1 minute limit
//         db.run(`INSERT INTO attendance (reg_number, date, time, status) VALUES (?, ?, ?, 'Present')`, 
//         [reg_number, date, time], (err) => {
//             if (err) {
//                 res.status(500).json({ message: 'Database error' });
//             } else {
//                 res.json({ success: true, message: 'Attendance marked as Present' });
//             }
//         });
//     } else {
//         db.run(`INSERT INTO attendance (reg_number, date, time, status) VALUES (?, ?, ?, 'Absent')`, 
//         [reg_number, date, time], (err) => {
//             if (err) {
//                 res.status(500).json({ message: 'Database error' });
//             } else {
//                 res.json({ success: false, message: 'Attendance session expired, marked as Absent' });
//             }
//         });
//     }
// });

router.post('/mark-attendance', (req, res) => {
    const { reg_number } = req.body;
    const currentTime = Date.now();
    const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const time = new Date().toISOString().split('T')[1].split('.')[0]; // Format: HH:MM:SS

    // Check if attendance session has started
    if (!attendanceStartTime || !attendanceTimeLimit) {
        return res.status(400).json({ success: false, message: 'Attendance has not started' });
    }

    // Check if within the allowed time window
    const timeElapsed = currentTime - attendanceStartTime;

    const status = timeElapsed <= attendanceTimeLimit ? 'Present' : 'Absent';

    db.run(
        `INSERT INTO attendance (reg_number, date, time, status) VALUES (?, ?, ?, ?)`,
        [reg_number, date, time, status],
        (err) => {
            if (err) {
                res.status(500).json({ success: false, message: 'Database error' });
            } else {
                const msg = status === 'Present' 
                    ? 'Attendance marked as Present' 
                    : 'Attendance session expired, marked as Absent';
                res.json({ success: status === 'Present', message: msg });
            }
        }
    );
});

// Student views attendance
router.post('/view-attendance', (req, res) => {
    const { reg_number } = req.body;
    db.all(`SELECT date, time, status FROM attendance WHERE reg_number = ?`, [reg_number], (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Database error' });
        } else {
            res.json({ success: true, attendance: rows });
        }
    });
});

const groupByTime = (records, interval = 2) => {
    const groups = [];
    let currentGroup = [];
    let lastTime = null;

    records.forEach(record => {
        const [hours, minutes, seconds] = record.time.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + seconds / 60;

        if (!lastTime || (totalMinutes - lastTime) <= interval) {
            currentGroup.push(record);
        } else {
            groups.push(currentGroup);
            currentGroup = [record];
        }

        lastTime = totalMinutes;
    });

    if (currentGroup.length) {
        groups.push(currentGroup);
    }

    return groups;
};

router.post('/faculty-view-attendance', (req, res) => {
    const date = new Date().toISOString().split('T')[0];

    db.all(`SELECT students.name, students.reg_number, attendance.time, attendance.date FROM attendance 
            JOIN students ON attendance.reg_number = students.reg_number 
            WHERE attendance.date = ? AND attendance.status = 'Present'
            ORDER BY attendance.time ASC`, [date], (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Database error' });
        } else {
            const grouped = groupByTime(rows);
            res.json({ success: true, groupedAttendance: grouped });
        }
    });
});

// Faculty views all students who marked attendance on time
// router.post('/faculty-view-attendance', (req, res) => {
//     const date = new Date().toISOString().split('T')[0]; // Get today's date

//     db.all(`SELECT students.name, students.reg_number FROM attendance 
//             JOIN students ON attendance.reg_number = students.reg_number 
//             WHERE attendance.date = ? AND attendance.status = 'Present'`, [date], (err, rows) => {
//         if (err) {
//             res.status(500).json({ message: 'Database error' });
//         } else {
//             res.json({ success: true, students: rows });
//         }
//     });
// });
router.post('/login', (req, res) => {
    const { username, identifier, role } = req.body;
    const table = role === 'student' ? 'students' : 'faculty';
    const column = role === 'student' ? 'reg_number' : 'faculty_id';

    console.log(`Login Attempt - Name: ${username}, ID: ${identifier}, Role: ${role}`);

    db.get(`SELECT * FROM ${table} WHERE name = ? AND ${column} = ?`, [username, identifier], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            res.status(500).json({ success: false, message: 'Database error' });
        } else if (row) {
            console.log("Login successful for:", row);
            res.json({ success: true, role });
        } else {
            console.log("Invalid credentials");
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});


module.exports = router;
