import path from 'path';

export const CHUNK_SIZE = 2 * 1024 * 1024;
export const UPLOAD_TEMP_DIR = path.join(process.cwd(), 'temp', 'chunks');
