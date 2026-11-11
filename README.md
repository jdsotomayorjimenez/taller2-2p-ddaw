# Taller #2 · Álbum de fotos con Express

API de un álbum de fotos para el taller de Node.js. Permite listar las fotos, consultar una por ID y crear nuevas entradas. Los datos se guardan en memoria y se reinician al detener el servidor.

## Ejecutar el proyecto

```bash
npm ci
npm run dev
```

La API escucha en `http://localhost:3000` por defecto.

## Pruebas en Postman

Usa `http://localhost:3000` como base de las URL. Para los `POST`, selecciona **Body → raw → JSON**.

| Método y ruta | Cuerpo JSON | Estado esperado |
| --- | --- | --- |
| `GET /api/fotos` | — | `200 OK` |
| `GET /api/fotos/9` | — | `404 Not Found` |
| `POST /api/fotos` | `{"titulo":"Cerro Santa Ana","calificacion":5}` | `201 Created` |
| `POST /api/fotos` | `{}` | `400 Bad Request` |
| `GET /api/error` | — | `500 Internal Server Error` |

### Listar fotos

![Postman muestra la lista de fotos y el estado 200](capturas/5.png)

### Consultar una foto inexistente

![Postman muestra el estado 404 al consultar la foto 9](capturas/6.png)

### Crear una foto

![Postman muestra la foto Cerro Santa Ana creada y el estado 201](capturas/7.png)

### Enviar un cuerpo sin título

![Postman muestra el estado 400 y el mensaje de título obligatorio](capturas/8.png)

### Probar el manejador de errores

![Postman muestra el estado 500 de la ruta de error](capturas/9.png)

## Pruebas en el navegador

### Listar fotos

![El navegador muestra la lista con Atardecer y Malecón](capturas/1.png)

### Consultar las fotos por ID

![El navegador muestra la foto 1, Atardecer](capturas/2.png)

![El navegador muestra la foto 2, Malecón](capturas/3.png)

### Probar la ruta de error

![El navegador muestra el mensaje de error interno del servidor](capturas/4.png)
