const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,    
        unique : true,
        lowercase : true,
    },
    password : {
        type : String,
        required : false,
        minlength : 6
    },  
    authProvider : {
        type : String,
        enum : ['email', 'google', 'facebook'],
        default : 'email'
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    otp : {
        type : String,
        required : false
    },
    otpExpires:{
        type : Date,
        required : false
    },
     
    resetPasswordOtp : {
        type : String,
        required : false
    },
    resetPasswordExpires : {
        type : Date,
        required : false
    }    
}, {timestamps : true});    

module.exports = mongoose.model('User', userSchema);