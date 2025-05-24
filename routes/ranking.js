// routes/ranking.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Función para convertir formato custom "20250524-100800" a ISO timestamp
function customToISO(customDate) {
  if (!customDate) return new Date().toISOString();
  
  // Parsear formato "20250524-100800"
  const year = customDate.substr(0, 4);
  const month = customDate.substr(4, 2);
  const day = customDate.substr(6, 2);
  const hour = customDate.substr(9, 2);
  const minute = customDate.substr(11, 2);
  const second = customDate.substr(13, 2);
  
  // Crear fecha en ISO format
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

// Función para convertir timestamp ISO a formato custom "20250524-100800"
function isoToCustom(isoDate) {
  if (!isoDate) return null;
  
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}-${hour}${minute}${second}`;
}

// Ruta GET: devuelve el ranking ordenado
router.get('/', async (req, res) => {
  try {
    console.log('[RANKING] Solicitud GET recibida');
    console.log('[RANKING] Consultando tabla puntajes en Supabase');
    
    const { data: puntajes, error } = await supabase
      .from('puntajes')
      .select('*')
      .order('puntaje', { ascending: false });

    if (error) {
      console.error('[RANKING] Error al consultar Supabase:', error);
      throw error;
    }
    
    console.log('[RANKING] Datos recibidos de Supabase, entradas encontradas:', puntajes.length);
    
    // Convertir fechahora de cada puntaje al formato custom para el frontend
    const puntajesFormatted = puntajes.map(puntaje => ({
      ...puntaje,
      fechaHora: isoToCustom(puntaje.fechahora) // Agregar campo con camelCase para compatibilidad
    }));
    
    console.log(`[RANKING] Enviando ${puntajesFormatted.length} puntajes con fechas convertidas`);
    
    res.json(puntajesFormatted);
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
router.post('/', async (req, res) => {
  console.log('[RANKING] Solicitud POST recibida:', req.body);
  const nuevo = req.body;
  
  // Verificar que los campos obligatorios estén presentes
  if (!nuevo.nombre || typeof nuevo.puntaje !== 'number') {
    console.log('[RANKING] Error: Formato inválido:', nuevo);
    return res.status(400).json({ error: 'Formato inválido' });
  }

  try {
    console.log('[RANKING] Validación de datos exitosa');
    
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
    
    // Convertir fechaHora de formato custom a ISO para Supabase
    const fechahoraISO = customToISO(nuevo.fechaHora);
    console.log('[RANKING] Fecha convertida:', nuevo.fechaHora, '->', fechahoraISO);
    
    console.log('[RANKING] Insertando puntaje en Supabase:', nuevo);
    
    const { data, error } = await supabase
      .from('puntajes')
      .insert([{
        nombre: nuevo.nombre,
        puntaje: nuevo.puntaje,
        version: nuevo.version,
        dispositivo: nuevo.dispositivo,
        ubicacion: nuevo.ubicacion,
        fechahora: fechahoraISO
      }])
      .select();

    if (error) {
      console.error('[RANKING] Error al insertar en Supabase:', error);
      throw error;
    }
    
    console.log('[RANKING] Puntaje insertado exitosamente en Supabase:', data);
    console.log(`[RANKING] Puntaje guardado exitosamente. ID: ${data[0]?.id}`);
    
    res.status(201).json({ mensaje: 'Puntaje guardado', data: data[0] });
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
