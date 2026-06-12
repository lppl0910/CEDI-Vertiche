import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import usersRouter from './src/routes/users.js';

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'] }));
app.use(express.json());

app.use('/users', usersRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ?? 3003;
app.listen(PORT, () => console.log(`backend-auth corriendo en http://localhost:${PORT}`));
