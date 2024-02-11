const express = require("express");
const authMiddleware = require("../controllers/authMiddleware");
const multer = require('multer');
const mime = require('mime-types');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const User = require("../Models/UserModel");
const logger  = require("../utils/logger")

const router = express.Router();

// Configure multer storage and file filter
const storage = multer.diskStorage({
   destination: path.join(__dirname, 'uploads/'), // Set your desired storage path
   filename: (req, file, cb) => {
      const extension = file.originalname.split('.').pop();
      const filename = uuidv4() + '.' + extension;
      cb(null, filename);
   },
});

const fileFilter = (req, file, cb) => {
   const mimeType = mime.lookup(file.originalname);

   if (!mimeType || !mimeType.startsWith('image/')) {
      // Invalid or non-image file type
      return cb(new Error('Invalid file type. Only images are allowed.'), false);
   }

   // You can add more checks based on mimeType if needed

   cb(null, true);
};


const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: {
      fileSize: 1024 * 1024 * 5, // 5 MB limit
   },
});

// Upload route
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
   try {
      const filename = req.file.filename;

      // Save file name to user data
      const update = await User.findByIdAndUpdate(req.authUser._id, {
         profilePhoto: filename
      }, { new: true })

      if(!update) {
         return res.status(500).json({
            success: false,
            message: "server.error",
         });
      }

      // Respond with the filename or any other relevant information
      res.status(200).json({
         success: true,
         filename: filename,
      });
   } catch (err) {
      logger(`Context: routes/upload.js Error: ${err.message}`, "red")
   }
});

// Serve uploaded images
router.get('/uploads/:filename', (req, res) => {
   const filename = req.params.filename;
   const filePath = path.join(__dirname, 'uploads', filename);

   res.sendFile(filePath);
});

module.exports = router;