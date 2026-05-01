const API_URL = '/api';

// CHECKING IF ALREADY LOGGED IN
window.onload = function() {
    if (localStorage.getItem('token')) {
        showDashboard();
    }
};

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!username || !password) {
        document.getElementById('auth-msg').innerText = 'please fill all fields';
        return;
    }

    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();
    document.getElementById('auth-msg').innerText = data.message || data.error;
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userCode', data.userCode);
        showDashboard();
    } else {
        document.getElementById('auth-msg').innerText = data.message || 'login failed';
    }
}

function logout() {
    localStorage.clear();
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');

    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const userCode = localStorage.getItem('userCode');

    document.getElementById('user-display').innerText = `${username} (${role})`;
    document.getElementById('user-code-display').innerText = userCode;

    // show admin panel only if admin
    if (role === 'admin') {
        document.getElementById('admin-controls').classList.remove('hidden');
    }

    loadTasks();
}

async function loadTasks() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const tasks = await res.json();
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';

    if (!tasks || tasks.length === 0) {
        container.innerHTML = '<p>no tasks yet</p>';
        return;
    }

    tasks.forEach(function(task) {
        const card = document.createElement('div');
        card.className = 'task-card';

        const project = task.project ? task.project.name : 'N/A';
        const assignedTo = task.assignedTo ? task.assignedTo.username : 'N/A';
        const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'no date';

        card.innerHTML = `
            <strong>${task.title}</strong> &nbsp;|&nbsp; Project: ${project}
            <br>
            <small>assigned to: ${assignedTo} &nbsp;|&nbsp; due: ${due} &nbsp;|&nbsp; status: <b>${task.status}</b></small>
            <br><br>
            <button onclick="markDone('${task._id}')">Mark as Complete</button>
        `;

        container.appendChild(card);
    });
}

async function createProject() {
    const name = document.getElementById('proj-name').value;
    if (!name) {
        alert('enter a project name');
        return;
    }

    const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name })
    });

    const data = await res.json();
    alert(data.message || data.error);
    document.getElementById('proj-name').value = '';
}

async function createTask() {
    const title = document.getElementById('task-title').value;
    const projectName = document.getElementById('task-proj-name').value;
    const userCode = document.getElementById('task-user-code').value;
    const dueDate = document.getElementById('task-date').value;

    if (!title || !projectName || !userCode || !dueDate) {
        alert('please fill all task fields');
        return;
    }

    const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, projectName, userCode, dueDate })
    });

    const data = await res.json();

    if (data.error) {
        alert(data.error);
    } else {
        alert('task assigned successfully!');
        loadTasks();
    }
}

async function markDone(taskId) {
    await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'completed' })
    });

    loadTasks();
}