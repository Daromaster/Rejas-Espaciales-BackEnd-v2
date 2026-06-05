// server.js
const express = require('express');
const cors = require('cors');
const rankingRouter = require('./routes/ranking');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Palabras Rotas
const palabrasRotasRouter = require('./routes/palabras_rotas');





// Configurar cliente de Supabase para endpoint /info
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/ranking', rankingRouter);
app.use('/palabras_rotas', palabrasRotasRouter);


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

// Endpoint de información del servidor (ahora con Supabase)
app.get('/info', async (req, res) => {
  try {
    const checkTimestamp = req.query.check_timestamp;
    console.log(`[INFO] Consulta de verificación - Timestamp: ${checkTimestamp || 'no timestamp'}`);
    console.log('[INFO] Consultando total de puntajes en Supabase');
    
    const { data, error, count } = await supabase
      .from('puntajes')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[INFO] Error al consultar Supabase:', error);
      throw error;
    }

    // Ya no intentamos escribir en health_checks
    res.json({
      revision: 'rev-2025-05-23',
      version: '2.1.0',
      totalScores: count || 0,
      lastUpdate: new Date().toISOString(),
      status: 'running',
      database: 'supabase',
      check_timestamp: checkTimestamp
    });
  } catch (error) {
    console.error('[INFO] Error:', error);
    
    res.json({
      revision: 'rev-2025-05-23',
      version: '2.1.0',
      totalScores: 0,
      lastUpdate: new Date().toISOString(),
      status: 'running',
      database: 'supabase',
      error: 'No se pudo consultar la base de datos',
      check_timestamp: req.query.check_timestamp
    });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Rejas Espaciales Backend v2.1.0', 
    status: 'running',
    endpoints: ['/health', '/status', '/info', '/ranking'],
    database: 'supabase'
  });
});


// Servidor en marcha
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});


