import { initDB, seedTemplates } from './db/database';
import { seed } from './db/seed';
import workorderRoutes from './routes/workorders';
import authRoutes from './routes/auth';
import commentRoutes from './routes/comments';
import notificationRoutes from './routes/notifications';
import templateRoutes from './routes/templates';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api/workorders', workorderRoutes);
app.use('/api/workorders', commentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/templates', templateRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 生产模式：托管前端静态文件（编译后 ../frontend/dist）
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((_req, res) => {
    if (!_req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

async function start() {
  await initDB();
  await seed();
  await seedTemplates();

  if (frontendDist.length) console.log('Frontend static files served from', frontendDist);

  const PORT = parseInt(process.env.PORT || '5680', 10);
  if (!process.env.VITEST) {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  }
}

// 非测试环境直接启动
if (!process.env.VITEST) {
  start();
}

export { app, initDB };
