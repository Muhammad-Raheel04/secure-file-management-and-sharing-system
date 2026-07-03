import express from 'express';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
const PORT = process.env.PORT;
const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.listen(PORT, () => {
    console.log(`visit http://localhost:${PORT}`)
})