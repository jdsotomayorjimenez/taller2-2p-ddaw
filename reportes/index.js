// Microservicio de REPORTES: no tiene base de datos propia,
// consulta al servicio de cursos por HTTP usando su NOMBRE de servicio
import express from 'express';

const PORT = process.env.PORT ?? 4000;
const CURSOS_URL = process.env.CURSOS_URL ?? 'http://localhost:3000';
const ESTUDIANTES_URL = process.env.ESTUDIANTES_URL ?? 'http://localhost:5000';

const app = express();

app.get('/', (_req, res) => res.json({ servicio: 'reportes', estado: 'ok' }));

app.get('/resumen', async (_req, res) => {
  let cursos;
  try {
    const respuesta = await fetch(`${CURSOS_URL}/cursos`);
    cursos = await respuesta.json();
  } catch {
    // Si "cursos" se cae, "reportes" sigue vivo y responde con un error controlado
    return res.status(503).json({ error: 'El servicio de cursos no responde' });
  }

  let estudiantes;
  try {
    const respuesta = await fetch(`${ESTUDIANTES_URL}/estudiantes`);
    estudiantes = await respuesta.json();
  } catch {
    // Lo mismo si se cae "estudiantes"
    return res.status(503).json({ error: 'El servicio de estudiantes no responde' });
  }

  const totalCreditos = cursos.reduce((suma, c) => suma + c.creditos, 0);
  res.json({
    totalCursos: cursos.length,
    totalCreditos,
    totalEstudiantes: estudiantes.length,
    generado: new Date().toISOString(),
  });
});

app.listen(PORT, () => console.log(`Servicio reportes escuchando en el puerto ${PORT}`));
