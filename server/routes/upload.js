const express = require("express");
const authMiddleware = require("../controllers/authMiddleware");
const multer = require('multer');
const mime = require('mime-types');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const User = require("../Models/UserModel");
const Upload = require("../Models/Upload");
const logger = require("../utils/logger")
const fs = require('fs').promises;

const router = express.Router();

const destinationPath = path.join(__dirname, '..', 'uploads/');

async function ensureDirectoryExists(directory) {
   try {
     await fs.access(directory);
   } catch (error) {
     if (error.code === 'ENOENT') {
       // Directory doesn't exist, create it
       await fs.mkdir(directory, { recursive: true });
     } else {
       // Handle other errors
       throw error;
     }
   }
 }

 ensureDirectoryExists(destinationPath);

// Configure multer storage and file filter
const storage = multer.diskStorage({
   destination: destinationPath,
   filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).slice(1);
      const filename = uuidv4() + '.' + extension;
      cb(null, filename);
   },
});

const fileFilter = (req, file, cb) => {
   const mimeType = mime.lookup(file.originalname);

   if (mimeType && mimeType.startsWith('image/') && (mimeType === 'image/jpeg' || mimeType === 'image/png')) {
      // Valid image type (JPEG or PNG)
      cb(null, true);
   } else {
      // Invalid image type
      cb(new Error('Invalid image type. Only JPEG and PNG images are allowed.'), false);
   }

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

      const saveInfo = new Upload({
         file: filename,
         owner: req.authUser._id,
      })

      const saveUpload = await saveInfo.save()

      if (!update || !saveUpload) {
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
      return res.status(500).json({
         success: false,
         message: "server.error",
      });
   }
});

// Serve uploaded images
router.get('/uploads/:filename', async (req, res) => {
   try {
      const { size } = req.query
      const filename = req.params.filename;
      const safeFilename = path.basename(filename); // Extracts the file name and removes any path components
      const filePath = path.join(__dirname, '..', 'uploads', safeFilename);

      const contentType = getContentType(safeFilename);
      res.set('Content-Type', contentType);

      if (size) {
         const height = size.split("x")[0];
         const width = size.split("x")[1];

         const metadata = await sharp(filePath).metadata();
         if (Number(height) / Number(width) === 1 && Number(width) <= metadata.width && Number(height) <= metadata.height) {
            const resizedBuffer = await resizeImage(filePath, Number(width), Number(height));
            // You can save the resized image or send it as a response
            res.send(resizedBuffer);
         } else {
            res.sendFile(filePath);
         }
      } else {
         res.sendFile(filePath);
      }
   } catch (err) {
      logger(`An error occurred in routes/upload.js: ${err.message}`, "red")
   }
});

function resizeImage(buffer, width, height) {
   return sharp(buffer)
      .resize(width, height)
      .toBuffer();
}

function getContentType(filename) {
   const extension = path.extname(filename).toLowerCase();
   switch (extension) {
      case '.jpg':
      case '.jpeg':
         return 'image/jpeg';
      case '.png':
         return 'image/png';
      // Add more cases as needed
      default:
         return 'application/octet-stream'; // Default to binary data
   }
}

module.exports = router;