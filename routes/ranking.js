// routes/ranking.js
const express = require('express');
const fs = require('fs');
const router = express.Router();
const PATH = './puntajes.json';

// Ruta GET: devuelve el ranking ordenado
router.get('/', (req, res) => {
  try {
    const data = fs.readFileSync(PATH, 'utf8');
    const puntajes = JSON.parse(data);
    puntajes.sort((a, b) => b.puntaje - a.puntaje);
    res.json(puntajes);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo leer el ranking.' });
  }
});

// Ruta POST: guarda un nuevo puntaje
router.post('/', (req, res) => {
  const nuevo = req.body;
  // Verificar que los campos obligatorios estén presentes
  if (!nuevo.nombre || typeof nuevo.puntaje !== 'number') {
    return res.status(400).json({ error: 'Formato inválido' });
  }

  try {
    const data = fs.readFileSync(PATH, 'utf8');
    const puntajes = JSON.parse(data);
    
    // Asegurarse de que los campos opcionales existan
    if (!nuevo.version) {
      nuevo.version = "desconocida";
    }
    
    puntajes.push(nuevo);
    fs.writeFileSync(PATH, JSON.stringify(puntajes, null, 2));
    res.status(201).json({ mensaje: 'Puntaje guardado' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar el puntaje.' });
  }
});

module.exports = router;
