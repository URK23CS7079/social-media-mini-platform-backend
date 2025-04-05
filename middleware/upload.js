const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social_media_posts', // Cloudinary folder name
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
  }
});

const upload = multer({ storage });

module.exports = upload;
