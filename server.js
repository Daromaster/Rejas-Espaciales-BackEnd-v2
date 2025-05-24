// server.jsconst express = require('express');const cors = require('cors');const rankingRouter = require('./routes/ranking');const { createClient } = require('@supabase/supabase-js');const app = express();const PORT = process.env.PORT || 3000;// Configurar cliente de Supabase para endpoint /infoconst SUPABASE_URL = process.env.SUPABASE_URL;const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

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

// Endpoint de información del servidor (ahora con Supabase)
app.get('/info', async (req, res) => {
  try {
    console.log('[INFO] Consultando total de puntajes en Supabase');
    
    const { data, error, count } = await supabase
      .from('puntajes')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[INFO] Error al consultar Supabase:', error);
      throw error;
    }

    res.json({
      revision: 'rev-2025-05-23',
      version: '2.1.0',
      totalScores: count || 0,
      lastUpdate: new Date().toISOString(),
      status: 'running',
      database: 'supabase'
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
      error: 'No se pudo consultar la base de datos'
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

// Rutas
app.use('/ranking', rankingRouter);

// Servidor en marcha
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
