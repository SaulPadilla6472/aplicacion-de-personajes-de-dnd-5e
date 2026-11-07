import express from 'express';
import cors from 'cors';
import {
    createCharacterHandler, getAllCharactersHandler 
} from './presentation/character.controller.js';


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint de verificación de estado (Health Check)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'dnd-character-api',
  });
});
// Rutas CRUD de Personajes
app.post('/api/characters', createCharacterHandler);
app.get('/api/characters', getAllCharactersHandler);

// Inicialización del servidor
app.listen(PORT, () => {
  console.log(`🚀 API Node.js corriendo en http://localhost:${PORT}`);
});