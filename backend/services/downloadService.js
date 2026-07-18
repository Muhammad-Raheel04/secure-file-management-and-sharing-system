import fs from 'fs';
import path from 'path';


export const getFileInfo = async (fileRecord) => {
    const absolutePath = path.resolve(fileRecord.filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error('File not found on disk');
    }

    const stats = fs.statSync(absolutePath);
    const size = stats.size;
    const mimeType = fileRecord.mimeType || 'application/octet-stream';
    const fileName = fileRecord.originalName;

    return {
        path: absolutePath,
        size,
        mimeType,
        fileName
    };
};


export const getFileStream = (filePath, range = null) => {
    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : undefined;

        return fs.createReadStream(filePath, { start, end });
    }

    return fs.createReadStream(filePath);
};


export const getContentRange = (start, end, total) => {
    return `bytes ${start}-${end}/${total}`;
};

export const parseRange = (range, fileSize) => {
    if (!range) return null;

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
        throw new Error('Range start exceeds file size');
    }

    return { start, end };
};