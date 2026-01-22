// cloudinary/scripts/uploadFiles.js

const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // load .env from project root

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify env variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary env variables are missing!');
  process.exit(1);
}

// Path to the folder containing bulletins
const folderPath = path.join(__dirname, '../bulletins'); // cloudinary/bulletins

// Recursive function to get all files in folder and subfolders
function getFiles(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  });
  return files;
}

// Upload files
const files = getFiles(folderPath);

files.forEach(file => {
  const relativePath = path.relative(folderPath, file);
  const cloudinaryFolder = path.dirname(relativePath).replace(/\\/g, '/'); // handle Windows paths
  const originalFileName = path.basename(file, path.extname(file)); // filename without extension
  const ext = path.extname(file); // file extension, e.g., .pdf

  cloudinary.uploader.upload(
    file,
    {
      folder: cloudinaryFolder,
      public_id: originalFileName, // keep original filename
      resource_type: 'raw'         // important for PDFs
    },
    (err, result) => {
      if (err) {
        console.error(`❌ Error uploading ${file}:`, err.message);
      } else {
        console.log(`✅ Uploaded ${file} -> ${result.secure_url}`);
      }
    }
  );
});
