require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { User, Project, Task } = require('./models');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

mongoose.connect(process.env.MONGO_URI, { tlsAllowInvalidCertificates: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('connection failed:', err));


function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'no token, please login first' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'token invalid or expired' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
}

// ADMIN WORK
function adminOnly(req, res, next) {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'only admins can do this' });
    }
    next();
}


// AUTHENTICATION
app.post('/api/auth/register', async (req, res) => {
    const { username, password, role } = req.body;

    const hashed = bcrypt.hashSync(password, 8);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
        const user = new User({ username, password: hashed, role, userCode: code });
        await user.save();
        res.status(201).json({ message: `registered successfully! your code is: ${code}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: 'user not found' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'wrong password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '24h' });

    res.json({
        username: user.username,
        role: user.role,
        userCode: user.userCode,
        accessToken: token
    });
});


// PROJECT MAKING AND MAINTAINING
app.get('/api/projects', checkToken, async (req, res) => {
    const projects = await Project.find();
    res.json(projects);
});

app.post('/api/projects', [checkToken, adminOnly], async (req, res) => {
    try {
        const project = new Project({ name: req.body.name });
        await project.save();
        res.json({ message: 'project created', project });
    } catch (err) {
        res.status(500).json({ error: 'could not create project, name might already exist' });
    }
});


// TASK MAKING AND MAINTAINING
app.get('/api/tasks', checkToken, async (req, res) => {
    let tasks;

    if (req.userRole === 'admin') {
        tasks = await Task.find()
            .populate('project', 'name')
            .populate('assignedTo', 'username userCode');
    } else {
        // members only see their own tasks
        tasks = await Task.find({ assignedTo: req.userId })
            .populate('project', 'name')
            .populate('assignedTo', 'username userCode');
    }

    res.json(tasks);
});

app.post('/api/tasks', [checkToken, adminOnly], async (req, res) => {
    const { title, projectName, userCode, dueDate } = req.body;

    const project = await Project.findOne({ name: projectName });
    if (!project) {
        return res.status(404).json({ error: `project "${projectName}" not found` });
    }

    const user = await User.findOne({ userCode: userCode });
    if (!user) {
        return res.status(404).json({ error: `no user found with code "${userCode}"` });
    }

    try {
        const task = new Task({
            title,
            project: project._id,
            assignedTo: user._id,
            dueDate
        });
        await task.save();
        res.json({ message: 'task assigned!', task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tasks/:id', checkToken, async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        return res.status(404).json({ message: 'task not found' });
    }

    if (req.userRole !== 'admin' && task.assignedTo.toString() !== req.userId) {
        return res.status(403).json({ message: "you can't update someone else's task" });
    }

    task.status = req.body.status || task.status;
    await task.save();
    res.json({ message: 'task updated', task });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});