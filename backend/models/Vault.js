const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    originalName: {
        type: String,
        required: [true, 'File must have a name']
    },
    fileUrl: {
        type: String,
        required: [true, 'Cloudinary file URL is required']
    },
    cloudinaryId: {
        type: String,
        required: [true, 'Cloudinary file ID is required']
    },
    fileType: {
        type: String,
        enum: ['image', 'document', 'other'],
        default: 'other'
    },
    size: {
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Vault' , vaultSchema);