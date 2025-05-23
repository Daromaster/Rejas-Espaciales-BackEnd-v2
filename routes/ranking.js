// routes/ranking.js
const express = require('express');
const fs = require('fs');
const router = express.Router();
const PATH = './puntajes.json';

// Ruta GET: devuelve el ranking ordenado
router.get('/', (req, res) => {
  try {
    console.log('[RANKING] Solicitud GET recibida');
    console.log('[RANKING] Intentando leer archivo:', PATH);
    console.log('[RANKING] Working directory:', process.cwd());
    
    // Verificar si el archivo existe
    if (!fs.existsSync(PATH)) {
      console.log('[RANKING] ⚠️ Archivo no existe, creando archivo vacío');
      fs.writeFileSync(PATH, '[]', 'utf8');
    }
    
    const data = fs.readFileSync(PATH, 'utf8');
    console.log('[RANKING] Archivo leído, contenido length:', data.length);
    
    const puntajes = JSON.parse(data);
    console.log('[RANKING] JSON parseado correctamente, entradas encontradas:', puntajes.length);
    
    puntajes.sort((a, b) => b.puntaje - a.puntaje);
    console.log(`[RANKING] Enviando ${puntajes.length} puntajes`);
    res.json(puntajes);
  } catch (error) {
    console.error('[RANKING] Error en GET:', error);
    console.error('[RANKING] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
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
    console.log('[RANKING] Validación de datos exitosa');
    
    // Verificar si el archivo existe antes de leer
    if (!fs.existsSync(PATH)) {
      console.log('[RANKING] Archivo no existe, creando nuevo archivo');
      fs.writeFileSync(PATH, '[]', 'utf8');
    }
    
    const data = fs.readFileSync(PATH, 'utf8');
    console.log('[RANKING] Archivo actual leído, tamaño:', data.length);
    
    const puntajes = JSON.parse(data);
    console.log('[RANKING] Puntajes actuales:', puntajes.length);
    
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
    console.log('[RANKING] Nuevo puntaje agregado, total ahora:', puntajes.length);
    
    fs.writeFileSync(PATH, JSON.stringify(puntajes, null, 2));
    console.log('[RANKING] Archivo guardado exitosamente');
    
    console.log(`[RANKING] Puntaje guardado exitosamente. Total: ${puntajes.length}`);
    res.status(201).json({ mensaje: 'Puntaje guardado' });
  } catch (error) {
    console.error('[RANKING] Error en POST:', error);
    console.error('[RANKING] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: 'No se pudo guardar el puntaje.' });
  }
});

module.exports = router;
