const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const baseUploadDir = path.join(__dirname, "../Uploads");

// Move fieldToDir outside the storage config so it's accessible
const fieldToDir = {
  logo: "firm",
  CategoryImg: "category",
  stockImg: "stock",
  rawMaterialImg: "rawMaterial",
  girviItemImg: "girviItem",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subfolder name based on fieldname
    const subDir = fieldToDir[file.fieldname] || "others";
    const uploadPath = path.join(baseUploadDir, subDir);

    // Create subdirectory if it doesn’t exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    req.uploadedFileRelativePath = path.join(
      fieldToDir[file.fieldname] || "others",
      file.fieldname +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname).replace(/\\/g, "/")
    );
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

module.exports = { upload };
