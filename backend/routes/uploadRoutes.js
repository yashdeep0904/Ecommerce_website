import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/multiple', requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
   

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided." });
    }

    // Bulletproof Base64 Upload Method
    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = "data:" + file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'shophub_inventory',
        resource_type: 'auto'
      });

      return result.secure_url;
    });

    
    const imageUrls = await Promise.all(uploadPromises);
    
    
    res.status(200).json({
      message: "Images uploaded successfully",
      imageUrls: imageUrls
    });

  } catch (error) {
    // If Cloudinary fails (e.g., bad API keys), it will print the exact reason here!
    console.error("🔴 Cloudinary Multi-Upload Error:", error);
    res.status(500).json({ message: "Failed to upload images to CDN." });
  }
});

export default router;