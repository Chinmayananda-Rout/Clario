const Project = require('../models/Project');
const Task = require('../models/Task');

const getProjects = async (req, res) => {
     try {
        const currentUserId = req.user.id || req.user.userId;
        const projects = await Project.find({ user: currentUserId });
        res.status(200).json(projects);
     } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
     }
};

const createProject = async (req, res) => {
    try {
        const {title, description, deadline, milestones} = req.body;
        const currentUserId = req.user.id || req.user.userId;

        if(!title){
            return res.status(400).json({ message: 'Please add a project title'});
        }

        const project = await Project.create({
            title,
            description,
            deadline,
            user: currentUserId
        });

        if (milestones && Array.isArray(milestones) && milestones.length > 0) {
            
            const tasksToCreate = milestones.map(milestoneTitle => {
                return {
                    title: milestoneTitle,
                    project: project._id, 
                    user: currentUserId,
                    category: 'Work' 
                };
            });

            await Task.insertMany(tasksToCreate);
        }

        res.status(201).json({
            message: 'Project created successfully',
            project: project
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while creating project',});
    }
};

const updateProject = async (req, res) => {
    try {
        const currentUserId = req.user._id || req.user.userId;
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.user.toString() !== currentUserId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating project' });
    }
};

const deleteProject = async (req, res) => {
    try {
        const currentUserId = req.user._id || req.user.userId;
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.user.toString() !== currentUserId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Task.deleteMany({ project: req.params.id });
        await project.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Project and all associated milestones deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting project' });
    }
};

const getProjectProgress = async (req, res) => {
    try {
        const currentUserId = req.user._id || req.user.userId;
        const project = await Project.findById(req.params.id);
        if(!project || project.user.toString() !== currentUserId.toString()){
            return res.status(404).json({ message: 'Project not found or not authorized' });
        }

        const milestones = await Task.find({ project: req.params.id });
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter(milestone => milestone.status === 'Completed').length;

        let progressPercentage = 0;
        if(totalMilestones > 0){
            progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);
        }

        res.status(200).json({
            project,
            progress: {
                total: totalMilestones,
                completed: completedMilestones,
                percentage: progressPercentage
            },
            milestones
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching project progress'
        })
    }
};

module.exports = {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectProgress
};  
