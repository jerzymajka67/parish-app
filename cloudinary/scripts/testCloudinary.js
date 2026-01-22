// scripts/testCloudinary.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function test() {
  try {
    const result = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      { folder: 'test' }
    );

    console.log('✅ Cloudinary works');
    console.log(result.secure_url);
  } catch (err) {
    console.error('❌ Cloudinary error');
    console.error(err);
  }
}

test();
