// routes/ranking.js
const express = require('express');
const fs = require('fs');
const router = express.Router();
const PATH = './puntajes.json';

// Ruta GET: devuelve el ranking ordenado
router.get('/', (req, res) => {
  try {
    console.log('[RANKING] Solicitud GET recibida');
    const data = fs.readFileSync(PATH, 'utf8');
    const puntajes = JSON.parse(data);
    puntajes.sort((a, b) => b.puntaje - a.puntaje);
    console.log(`[RANKING] Enviando ${puntajes.length} puntajes`);
    res.json(puntajes);
  } catch (error) {
    console.error('[RANKING] Error en GET:', error);
    res.status(500).json({ error: 'No se pudo leer el ranking.' });
  }
});

// Ruta POST: guarda un nuevo puntaje
router.post('/', (req, res) => {
  console.log('[RANKING] Solicitud POST recibida:', req.body);
  const nuevo = req.body;
  
  // Verificar que los campos obligatorios estén presentes
  if (!nuevo.nombre || typeof nuevo.puntaje !== 'number') {
    console.log('[RANKING] Error: Formato inválido:', nuevo);
    return res.status(400).json({ error: 'Formato inválido' });
  }

  try {
    const data = fs.readFileSync(PATH, 'utf8');
    const puntajes = JSON.parse(data);
    
    // Asegurarse de que los campos opcionales existan
    if (!nuevo.version) {
      nuevo.version = "desconocida";
    }
    
    // Asegurar que el campo de fecha y hora exista
    if (!nuevo.fechaHora) {
      // Generar fecha/hora del servidor como fallback
      const ahora = new Date();
      const fecha = ahora.getFullYear() +
          String(ahora.getMonth() + 1).padStart(2, '0') +
          String(ahora.getDate()).padStart(2, '0');
      const hora = String(ahora.getHours()).padStart(2, '0') +
          String(ahora.getMinutes()).padStart(2, '0') +
          String(ahora.getSeconds()).padStart(2, '0');
      nuevo.fechaHora = `${fecha}-${hora}`;
    }
    
    puntajes.push(nuevo);
    fs.writeFileSync(PATH, JSON.stringify(puntajes, null, 2));
    console.log(`[RANKING] Puntaje guardado exitosamente. Total: ${puntajes.length}`);
    res.status(201).json({ mensaje: 'Puntaje guardado' });
  } catch (error) {
    console.error('[RANKING] Error en POST:', error);
    res.status(500).json({ error: 'No se pudo guardar el puntaje.' });
  }
});

module.exports = router;
