import multer from 'multer';
import path from 'path';

// Configure multer for file upload
const storage = multer.memoryStorage(); // Store in memory for parsing

const fileFilter = (req, file, cb) => {
  // Accept only CSV files
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.csv') {
    return cb(new Error('Only CSV files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default upload;
