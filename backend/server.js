import express from 'express';
import 'dotenv/config';
import './cron/deletedExpiredFiles.js';
import './workers/excelWorker.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import fileShareRoutes from './routes/fileShareRoutes.js';
import accessRoutes from './routes/fileAccessRoutes.js';
const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/file', fileRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/document', documentRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/share-file', fileShareRoutes);
app.use('/api/v1/file-access', accessRoutes);
app.listen(PORT, () => {
    console.log(`visit http://localhost:${PORT}`)
})