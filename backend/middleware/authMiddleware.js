const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized. User no longer exists in database.' });
            }
            next();
        }
        catch(error){
            console.error('JWT Error:', error.message);
            res.status(401).json({message : "Not authorized, token failed"});
        }
    }
    if(!token){
        res.status(401).json({message : "Not authorized, no token provided"});
    }
};

module.exports = { protect };