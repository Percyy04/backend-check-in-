import multer from 'multer';
import { BadRequestError } from '../utils/errors.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only video files allowed'), false);
    }
  } else if (file.fieldname === 'image') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only image files allowed'), false);
    }
  } else if (file.fieldname === 'file') {
    // Accept CSV files for import
    if (file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only CSV files allowed'), false);
    }
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

export const uploadVideo = upload.single('video');
export const uploadImage = upload.single('image');
