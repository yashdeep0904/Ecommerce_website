import multer from 'multer';

// Store the file in memory as a Buffer so we can stream it directly to Cloudinary
const storage = multer.memoryStorage();

// Accept only standard image files up to 5MB
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});