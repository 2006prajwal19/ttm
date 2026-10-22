import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes/api.js';
import { initMongoose } from './src/server/db/mongoose.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API Router
app.use('/api', apiRouter);

// Vite middleware in development or static serving in production
async function startServer() {
  // Connect to MongoDB
  await initMongoose();
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aetheria Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Aetheria Server] Failed to start:', err);
});
