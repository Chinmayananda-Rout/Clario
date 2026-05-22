const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        let user  = await User.findOne({email});
        if(user) {
            return res.status(400).json({message : 'User already exists'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password : hashedPassword
        });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            message : 'User registered successfully',
            token,
            user : {
                id : user._id,
                name : user.name,
                email : user.email
            },
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({message : 'Server error  during registration'});
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({message : 'Please provide both email and password'});
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message : 'Email not found'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({message : 'Invalid password'});
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
            message : 'Login successful',
            token,
            user : {    
                user: {
                    id : user._id,
                    name : user.name,
                    email : user.email
                }
            }
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({message : 'Server error during login'});
    }
};

module.exports = { registerUser, loginUser };