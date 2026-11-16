// Microservicio de REPORTES: no tiene base de datos propia,
// consulta al servicio de cursos por HTTP usando su NOMBRE de servicio
import express from 'express';

const PORT = process.env.PORT ?? 4000;
const CURSOS_URL = process.env.CURSOS_URL ?? 'http://localhost:3000';

const app = express();

app.get('/', (_req, res) => res.json({ servicio: 'reportes', estado: 'ok' }));

app.get('/resumen', async (_req, res) => {
  try {
    const respuesta = await fetch(`${CURSOS_URL}/cursos`);
    const cursos = await respuesta.json();
    const totalCreditos = cursos.reduce((suma, c) => suma + c.creditos, 0);
    res.json({ totalCursos: cursos.length, totalCreditos, generado: new Date().toISOString() });
  } catch {
    // Si "cursos" se cae, "reportes" sigue vivo y responde con un error controlado
    res.status(503).json({ error: 'El servicio de cursos no responde' });
  }
});

app.listen(PORT, () => console.log(`Servicio reportes escuchando en el puerto ${PORT}`));
