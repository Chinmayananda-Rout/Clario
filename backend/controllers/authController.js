const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        user = new User({
            name,
            email,
            password : hashedPassword,
            authProvider : 'email',
            isVerified : false,
            otp,
            otpExpires,
        });
        await user.save();

        const message = `Welcome to Clario! Your OTP for account verification is ${otp}. It will expire in 10 minutes.`;
        await sendEmail({
            email : user.email,
            subject : 'Clario Account Verification',
            message : message
        });

        res.status(201).json({message : 'Registration successful. Please check your email for the OTP to verify your account.'});

    }catch (error) {
        console.error(error);
        res.status(500).json({message : 'Server error during registration'});
    }
};
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if(!email || !otp) {
            return res.status(400).json({message : 'Please provide both email and OTP'});
        }

        const user = await User.findOne({email});
        if(!user || user.otp !== otp) {
            return res.status(400).json({message : 'Invalid OTP or email'});
        }

        if(user.otpExpires < Date.now()) {
            return res.status(400).json({message : 'OTP has expired'});
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
            message : 'Account verified successfully',
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

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
            message : 'Login successful',
            token,
            user : {    
                    id : user._id,
                    name : user.name,
                    email : user.email    
            }
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({message : 'Server error during login'});
    }
};

const googleCallback = (req, res) => {
    try {
        const user = req.user;
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
            message : 'Google login successful',
            token,
            user : {       
                id : user._id,
                name : user.name,
                email : user.email
            }
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({message : 'Server error during Google login'});
    }
};

module.exports = { registerUser, verifyOtp, loginUser, googleCallback };