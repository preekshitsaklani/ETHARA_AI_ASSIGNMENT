const mongoose = require('mongoose');

// STORING LOGIN DETAILS & ROLE
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    userCode: { type: String, unique: true }
});

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String }
});

// TASK IS CONNECTED TO BOTH MEMBER AND MAIN HEAD
const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date, required: true }
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Project: mongoose.model('Project', ProjectSchema),
    Task: mongoose.model('Task', TaskSchema)
};