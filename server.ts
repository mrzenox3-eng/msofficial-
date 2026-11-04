import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { apiRouter } from './server/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parser with 25MB limit for screenshots/attachments
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Ensure backend uploads directory exists for storing screenshots
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const uploadSubdirs = ['screenshots', 'payments', 'support', 'general'];
  try {
    const fs = await import('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    for (const sub of uploadSubdirs) {
      const subPath = path.join(uploadsDir, sub);
      if (!fs.existsSync(subPath)) {
        fs.mkdirSync(subPath, { recursive: true });
      }
    }
  } catch (dirErr) {
    console.warn('[Server] Notice during uploads dir initialization:', dirErr);
  }

  // Serve backend screenshot uploads statically
  app.use('/uploads', express.static(uploadsDir));

  // Serve public assets directly (including backend.zip)
  const publicDir = path.resolve(process.cwd(), 'public');
  app.use(express.static(publicDir));

  // Direct endpoint to download standalone backend zip file
  app.get(['/backend.zip', '/api/download/backend', '/download/backend'], (_req, res) => {
    const zipPath = path.join(publicDir, 'backend.zip');
    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="ms-official-backend.zip"');
      return res.sendFile(zipPath);
    }
    return res.status(404).send('Backend zip file not found');
  });

  // Direct endpoint to download fullstack (frontend + backend) zip file for GitHub Pages
  app.get(
    [
      '/fullstack.zip',
      '/ms-official-fullstack-github-pages.zip',
      '/api/download/fullstack',
      '/download/fullstack',
      '/api/download/github-pages'
    ],
    (_req, res) => {
      const zipPath = path.join(publicDir, 'ms-official-fullstack-github-pages.zip');
      if (fs.existsSync(zipPath)) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="ms-official-fullstack-github-pages.zip"');
        return res.sendFile(zipPath);
      }
      return res.status(404).send('Fullstack zip file not found');
    }
  );

  // Direct endpoint to download frontend package (with all attached pages)
  app.get(
    [
      '/frontend.zip',
      '/ms-official-frontend-full-pages.zip',
      '/api/download/frontend',
      '/download/frontend'
    ],
    (_req, res) => {
      const zipPath = path.join(publicDir, 'ms-official-frontend-full-pages.zip');
      if (fs.existsSync(zipPath)) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="ms-official-frontend-full-pages.zip"');
        return res.sendFile(zipPath);
      }
      return res.status(404).send('Frontend zip file not found');
    }
  );

  // Domain Verification endpoints (Aster Mail, DNS TXT, web verification)
  const ASTER_VERIFY_PAYLOAD = 'aster-verify=Q/MF37XXjZZduH/0BCx/1vf9cevyq+YVUH9aD23uBek=';
  app.get(
    ['/_aster-verify', '/.well-known/_aster-verify', '/.well-known/aster-verify', '/aster-verify.txt', '/_aster-verify.txt'],
    (_req, res) => {
      res.type('text/plain').send(ASTER_VERIFY_PAYLOAD);
    }
  );

  // Mount API router
  app.use('/api', apiRouter);

  // In development, hook Vite middleware
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MS Official] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
