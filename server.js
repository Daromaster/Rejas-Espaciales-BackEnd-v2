// server.js
const express = require('express');
const cors = require('cors');
const rankingRouter = require('./routes/ranking');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    revision: 'rev-2025-05-23',
    version: '2.1.0'
  });
});

// Endpoint de status
app.get('/status', (req, res) => {
  res.json({ 
    status: 'active', 
    version: '2.1.0',
    service: 'rejas-espaciales-backend'
  });
});

// Endpoint de información del servidor
app.get('/info', (req, res) => {
  try {
    const data = fs.readFileSync('./puntajes.json', 'utf8');
    const puntajes = JSON.parse(data);
    res.json({
      revision: 'rev-2025-05-23',
      version: '2.1.0',
      totalScores: puntajes.length,
      lastUpdate: new Date().toISOString(),
      status: 'running'
    });
  } catch (error) {
    res.json({
      revision: 'rev-2025-05-23',
      version: '2.1.0',
      totalScores: 0,
      lastUpdate: new Date().toISOString(),
      status: 'running',
      error: 'No se pudo leer puntajes'
    });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Rejas Espaciales Backend v2.1.0', 
    status: 'running',
    endpoints: ['/health', '/status', '/info', '/ranking']
  });
});

// Rutas
app.use('/ranking', rankingRouter);

// Servidor en marcha
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
