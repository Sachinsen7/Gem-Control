
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const baseUploadDir = path.join(__dirname, "../Uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subfolder name based on fieldname or req.body.type
    let subDir = "others";

    // Option 1: Based on fieldname
    const validDirs = ["category", "firm", "stock"];
    if (validDirs.includes(file.fieldname)) {
      subDir = file.fieldname;
    }


    const uploadPath = path.join(baseUploadDir, subDir);

    // Create subdirectory if it doesn’t exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

module.exports = { upload };
