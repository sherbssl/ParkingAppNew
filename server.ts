import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route: Live LTA CarParkAvailabilityv2 proxy
app.get('/api/carparks/availability', async (req, res) => {
  const accountKey = (req.headers['accountkey'] as string) || process.env.LTA_ACCOUNT_KEY || '';

  if (!accountKey) {
    return res.json({
      success: true,
      source: 'simulated_backup',
      message: 'No LTA_ACCOUNT_KEY provided. Using enriched real-time simulated feed. Set LTA_ACCOUNT_KEY to connect to live LTA DataMall.',
      value: [],
    });
  }

  try {
    const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2', {
      method: 'GET',
      headers: {
        AccountKey: accountKey,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        source: 'lta_datamall_error',
        status: response.status,
        error: errorText || response.statusText,
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      source: 'lta_datamall',
      timestamp: new Date().toISOString(),
      value: data.value || [],
    });
  } catch (err: any) {
    console.error('Error fetching LTA DataMall carpark availability:', err);
    return res.status(500).json({
      success: false,
      source: 'server_error',
      error: err?.message || 'Failed to fetch LTA DataMall',
    });
  }
});

// API route: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasLtaKey: !!process.env.LTA_ACCOUNT_KEY,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
