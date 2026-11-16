// Microservicio de ESTUDIANTES: lista estudiantes guardados en memoria
import express from 'express';

const PORT = process.env.PORT ?? 5000;

// Datos en memoria: se reinician cada vez que el contenedor arranca
const estudiantes = [
  { id: 1, nombre: 'Ana Torres', carrera: 'Ingeniería de Software' },
  { id: 2, nombre: 'Luis Mendoza', carrera: 'Ingeniería de Software' },
  { id: 3, nombre: 'María Cedeño', carrera: 'Ciencia de Datos' },
  { id: 4, nombre: 'Carlos Vera', carrera: 'Ciberseguridad' },
  { id: 5, nombre: 'Sofía Ramírez', carrera: 'Ciencia de Datos' },
];

const app = express();

app.get('/', (_req, res) => res.json({ servicio: 'estudiantes', estado: 'ok' }));

// Listar estudiantes
app.get('/estudiantes', (_req, res) => res.json(estudiantes));

app.listen(PORT, () => console.log(`Servicio estudiantes escuchando en el puerto ${PORT}`));
