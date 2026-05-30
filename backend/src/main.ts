import './db/database';
import { seed } from './db/seed';
import workorderRoutes from './routes/workorders';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
seed();
app.use('/api/workorders', workorderRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = parseInt(process.env.PORT || '5680', 10);
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export { app };
