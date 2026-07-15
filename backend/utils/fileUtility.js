import fsPromises from 'fs/promises';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import { UPLOAD_TEMP_DIR } from '../constants/fileConstants.js';

export const removeFileFromDisk = async (filePath) => {
    if (!filePath) {
        return;
    }
    try {
        await fsPromises.unlink(filePath).catch(() => { })

        const directory = path.dirname(filePath);

        const files = await fsPromises.readdir(directory);

        if (files.length === 0) {
            await fs.rmdir(directory);
        }

    } catch (e) {
        console.error(e);
    }
}

export const sanitizeFileName = (fileName) => {
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export const getUploadSessionDir = (uploadId) => {
    return path.join(UPLOAD_TEMP_DIR, uploadId);
}

export const getUploadedChunks = async (uploadDir) => {
    if (!fs.existsSync(uploadDir)) {
        return [];
    }

    const files = await fsExtra.readdir(uploadDir);

    return files
        .filter(f => f.startsWith('chunk_'))
        .map(f => parseInt(f.replace('chunk_', '')))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b)
}