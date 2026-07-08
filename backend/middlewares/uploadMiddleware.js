import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const { category } = req.body;
            console.log(category);
            const uploadPath = path.join(process.cwd(), "uploads", category);
            await fs.mkdir(uploadPath, { recursive: true });

            cb(null, uploadPath)
        } catch (err) {
            cb(err.message)
        }

    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})

export const upload = multer({ storage });