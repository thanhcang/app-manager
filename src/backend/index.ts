import express from 'express';
import { routes } from './routes';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
});

const app = express();
const port = 5172;

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.status(200).send('✅ Connected');
});
app.use('/api', routes);

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});