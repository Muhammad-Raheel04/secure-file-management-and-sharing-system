import fs from 'fs/promises';
import path from 'path';

export const removeFileFromDisk = async (filePath) => {
    if (!filePath) {
        return;
    }
    try {
        await fs.unlink(filePath).catch(() => { })

        const directory = path.dirname(filePath);

        const files = await fs.readdir(directory);

        if (files.length === 0) {
            await fs.rmdir(directory);
        }

    } catch (e) {
        console.error(e);
    }
}