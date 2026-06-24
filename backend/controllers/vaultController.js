const Vault = require("../models/Vault");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFile = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({message: 'No file provided '});
        }

        const currentUserId = req.user._id || req.user.userId;

        const streamUpload = (req) => {
            return new Promise((resolve, reject) =>{
                const cleanFileName = req.file.originalname.split('.')[0] + '-' + Date.now();
                const stream = cloudinary.uploader.upload_stream(
                    {folder: `Clario_vault/${currentUserId}`,
                     resource_type: 'auto',
                     public_id: cleanFileName
                    },
                    (error, result) => {
                        if (result){
                            resolve(result);
                        } else{
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);

        const vaultItem = await Vault.create({
            user: currentUserId,
            originalName: req.file.originalname,
            fileUrl: result.secure_url,
            cloudinaryId: result.public_id,
            fileType: req.file.mimetype.startsWith('image') ? 'image' : 'document',
            size: req.file.size
        });

        res.status(201).json({
            message: 'File uploaded successfully',
            file: vaultItem
        });
    } catch (error) {
        console.error("Vault Upload Error", error);
        res.status(500).json({message: 'Server error during file upload' });
    }
};


const getFiles = async (req, res) => {
    try {
        const currentUserId = req.user._id || req.user.userId;
        const files = await Vault.find({ user: currentUserId }).sort({ createdAt: -1 });
        
        res.status(200).json(files);
    } catch (error) {
        console.error("Vault Fetch Error:", error);
        res.status(500).json({ message: 'Server error fetching files' });
    }
};


const deleteFile = async (req, res) => {
    try{
        const currentUserId = req.user._id || req.user.userId;
        const fileId = req.params.id;
        const vaultItem = await Vault.findById(fileId);

        if(!vaultItem) {
            return res.status(401).json({message: 'File not found '});
        }

        if(vaultItem.user.toString() !== currentUserId.toString()) {
            return res.status(401).json({message: 'Not authorized to delete this file'});
        }

        await cloudinary.uploader.destroy(vaultItem.cloudinaryId);
        await vaultItem.deleteOne();

        res.status(200).json({ id: fileId, message: 'File permanently deleted' });
    } catch (error) {
        console.error("Vault Deletion Error", error);
        res.status(500).json({message: 'Server error during file deletion'});
    }
};

module.exports = { uploadFile, getFiles, deleteFile  };