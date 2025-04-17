import express from 'express';
import { routes } from './routes';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
});

const app = express();
const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000; // Default to 3000 if undefined
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.status(200).send('✅ Connected');
});
app.use('/api', routes);

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});