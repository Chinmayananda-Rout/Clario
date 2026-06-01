const Task = require('../models/task');

const createTask = async (req, res) => {
    try{
        const { title, category, priority, dueDate } = req.body;

        if(!title) {
            return res.status(400).json({message : 'Title is required'});
        }

        const task = new Task({
            user : req.user._id || req.user.userId,
            title,
            category,
            priority,
            dueDate
        });

        await task.save();

        res.status(201).json({task});
    }catch (error) {
        console.error(error);
        res.status(500).json({message : 'Server error while creating task'});   
    }
};

const getTasks = async (req, res) => {
    try{
        const tasks = await Task.find({user : req.user._id || req.user.userId}).sort({createdAt : -1}); 

        res.status(200).json({tasks});
    }catch (error) {
        console.error(error);
        res.status(500).json({message : 'Server error while fetching tasks'});   
    }   
};

const updateTask = async (req, res) => {
    try{
        const { title, category, priority, dueDate, status } = req.body;
        const currentUserId = req.user._id || req.user.userId;

        let task = await Task.findById(req.params.id);

        if(!task) {
            return res.status(404).json({message : 'Task not found'});
        }
        
        if(task.user.toString() !== currentUserId.toString()) {
            return res.status(403).json({message : 'Not authorized to update this task'});
        }

        if(title !== undefined) task.title = title;
        if(category !== undefined) task.category = category;
        if(priority !== undefined) task.priority = priority;
        if(dueDate !== undefined) task.dueDate = dueDate;
        if(status !== undefined) task.status = status;

        await task.save();

        res.status(200).json({task});
    }catch (error) {
        console.error(error);
        if(error.kind === 'ObjectId') {
            return res.status(400).json({message : 'Task not found'});
        }
        res.status(500).json({message : 'Server error while updating task'});
    }
};

const deleteTask = async (req , res) => {
    try{
        const currentUserId = req.user._id || req.user.userId;
        let task = await Task.findById(req.params.id);

        if(!task) {
            return res.status(404).json({message : 'Task not found'});
        }

        if(task.user.toString() !== currentUserId.toString()) {
            return res.status(401).json({message : 'Not authorized to delete this task'});  
        }

        await task.deleteOne();

        res.status(200).json({message : 'Task deleted successfully'});
    }catch (error) {
        console.error(error);
        if(error.kind === 'ObjectId') {
            return res.status(400).json({message : 'Task not found'});
        }   
        res.status(500).json({message : 'Server error while deleting task'});           
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};