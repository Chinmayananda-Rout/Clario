const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    title: {
        type : String,
        required : true,
        trim : true
    },
    category: {
        type : String,
        enum : ['Work', 'Personal', 'Study', 'Others'],
        default : 'Others'
    },
    priority: {
        type : String,
        enum : ['High', 'Medium', 'Low'],
        default : 'Medium'
    },
    dueDate: {
        type : Date,
        required : false
    },
    status: {
        type : String,
        enum : ['Pending', 'In Progress', 'Completed'],
        default : 'Pending'
    }
}, {timestamps : true});

module.exports = mongoose.model('Task', taskSchema);