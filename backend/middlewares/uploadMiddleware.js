import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_TEMP_DIR } from '../constants/fileConstants.js';
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const { category } = req.body;
            const uploadPath = path.join(process.cwd(), "uploads", category);
            await fs.mkdir(uploadPath, { recursive: true });

            cb(null, `uploads/${category}`)
        } catch (err) {
            cb(err.message)
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})

export const upload = multer({ storage });

const chunkStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(UPLOAD_TEMP_DIR, { recursive: true });
            cb(null, UPLOAD_TEMP_DIR);
        } catch (err) {
            cb(err);
        }
    },

    filename(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

export const chunkUpload = multer({
    storage: chunkStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
});