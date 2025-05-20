// server.js
const express = require('express');
const cors = require('cors');
const rankingRouter = require('./routes/ranking');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/ranking', rankingRouter);

// Servidor en marcha
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
