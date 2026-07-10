import express from 'express';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
const PORT = process.env.PORT;
const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/file', fileRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/category',categoryRoutes)
app.listen(PORT, () => {
    console.log(`visit http://localhost:${PORT}`)
})