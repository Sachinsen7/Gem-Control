const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.Cloudnary_CLOUD_NAME,
  api_key: process.env.Cloudnary_API_KEY,
  api_secret: process.env.Cloudnary_API_SECRET,
});




// Map fieldnames to Cloudinary folders
const fieldToDir = {
  logo: "firm",
  CategoryImg: "category",
  stockImg: "stock",
  rawMaterialImg: "rawMaterial",
  girviItemImg: "girviItem",
};

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on fieldname
    const folder = fieldToDir[file.fieldname] || "others";
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const publicId = `${file.fieldname}-${uniqueSuffix}`;
    
    // Store the relative path for later use (Cloudinary format)
    // NOTE: Don't include folder in publicId, it's separate
    req.uploadedFileRelativePath = `${folder}/${publicId}`;
    
    return {
      folder: folder,
      public_id: publicId,
      resource_type: "auto", // Automatically detect file type
      allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "webp"], // Adjust as needed
    };
  },
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };