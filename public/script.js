async function markAttendance() {
    const reg_number = prompt("Enter your registration number:");
    if (!reg_number) return;

    const response = await fetch('/api/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg_number })
    });

    const data = await response.json();
    alert(data.message);
}

async function viewAttendance() {
    const reg_number = prompt("Enter your registration number:");
    if (!reg_number) return;

    const response = await fetch('/api/view-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg_number })
    });

    const data = await response.json();
    if (data.success) {
        let attendanceList = "<h3>Your Attendance</h3><ul>";
        data.attendance.forEach(record => {
            attendanceList += `<li>Date: ${record.date} - Status: ${record.status}</li>`;
        });
        attendanceList += "</ul>";
        document.getElementById("attendanceList").innerHTML = attendanceList;
    } else {
        alert("Error fetching attendance.");
    }
}

async function startAttendance() {
    const response = await fetch('/api/start-attendance', { method: 'POST' });
    const data = await response.json();
    alert(data.message);
}

async function facultyViewAttendance() {
    const response = await fetch('/api/faculty-view-attendance', { method: 'POST' });
    const data = await response.json();

    if (data.success) {
        let attendanceTable = "<h3>Present Students</h3><table border='1'><tr><th>Name</th><th>Reg Number</th></tr>";
        data.students.forEach(student => {
            attendanceTable += `<tr><td>${student.name}</td><td>${student.reg_number}</td></tr>`;
        });
        attendanceTable += "</table>";
        document.getElementById("attendanceTable").innerHTML = attendanceTable;
    } else {
        alert("Error fetching attendance.");
    }
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const username = document.getElementById('username').value;
        const identifier = document.getElementById('identifier').value;
        const role = document.getElementById('role').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, identifier, role })
            });

            const data = await response.json();
            
            if (data.success) {
                // Redirect user based on their role
                if (role === 'student') {
                    window.location.href = 'student_dashboard.html';
                } else if (role === 'faculty') {
                    window.location.href = 'faculty_dashboard.html';
                }
            } else {
                alert(data.message); // Show an error message if login fails
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Server error, please try again.');
        }
    });
});
