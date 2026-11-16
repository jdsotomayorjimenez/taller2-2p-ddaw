// Microservicio de CURSOS: guarda y lista cursos en MongoDB
import express from 'express';
import mongoose from 'mongoose';

const PORT = process.env.PORT ?? 3000;
const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27017/academia';

const Curso = mongoose.model('Curso', new mongoose.Schema({
  nombre: { type: String, required: true },
  creditos: { type: Number, default: 3 },
}));

const app = express();
app.use(express.json());

app.get('/', (_req, res) => res.json({ servicio: 'cursos', estado: 'ok' }));

// Listar cursos
app.get('/cursos', async (_req, res) => res.json(await Curso.find()));

// Crear un curso de ejemplo desde el navegador
app.get('/cursos/demo', async (_req, res) => {
  const curso = await Curso.create({ nombre: 'Desarrollo Web', creditos: 4 });
  res.status(201).json(curso);
});

// Crear un curso enviando JSON (Postman, Thunder Client, curl)
app.post('/cursos', async (req, res) => {
  const curso = await Curso.create(req.body);
  res.status(201).json(curso);
});

await mongoose.connect(MONGO_URL);
console.log('Conectado a MongoDB');
app.listen(PORT, () => console.log(`Servicio cursos escuchando en el puerto ${PORT}`));
