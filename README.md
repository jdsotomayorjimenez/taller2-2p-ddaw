# Taller #2 · Álbum de fotos con Express

API de un álbum de fotos desarrollada con Node.js y Express. Permite listar las fotos, consultar una por ID, crear nuevas entradas, actualizar campos y eliminar fotos. Los datos se guardan en memoria.

> **Objetivo:** practicar rutas y middlewares de Express, recibir y responder datos en JSON y completar un CRUD de fotos almacenadas en memoria.

## Requisitos y ejecución

Se necesita Node.js con soporte para `node --watch` y npm. Para reproducir las pruebas se utiliza Postman; las consultas GET también pueden realizarse desde el navegador.

Desde la carpeta del proyecto:

```bash
npm ci
npm run dev
```

La API escucha en [http://localhost:3000](http://localhost:3000) por defecto. El puerto puede cambiarse mediante la variable de entorno `PORT`. Para detener el servidor, presiona `Ctrl+C`.

## Pruebas y capturas

### Postman

Usa `http://localhost:3000` como base de las URL. Para los `POST` y `PATCH`, selecciona **Body → raw → JSON**. Los `GET` y `DELETE` no necesitan cuerpo.

Las consultas iniciales parten de las fotos con ID `1` y `2`. Para comprobar la eliminación, ejecuta primero el `DELETE /api/fotos/2` y después las consultas que deben responder `404`. Los IDs de las fotos nuevas dependen de cuántas se hayan creado desde el último reinicio.

| Método y ruta | Cuerpo JSON | Estado esperado |
| --- | --- | --- |
| `GET /api/fotos` | — | `200 OK` |
| `GET /api/fotos/9` | — | `404 Not Found` |
| `POST /api/fotos` | `{"titulo":"Cerro Santa Ana","calificacion":5}` | `201 Created` |
| `POST /api/fotos` | `{}` | `400 Bad Request` |
| `PATCH /api/fotos/1` | `{"calificacion":0}` | `200 OK`, con `calificacion: 0` y los demás campos conservados |
| `GET /api/fotos/1` después del PATCH | — | `200 OK`, con la calificación actualizada |
| `PATCH /api/fotos/9` | `{"titulo":"Prueba"}` | `404 Not Found` |
| `PATCH /api/fotos/1` | `{"titulo":""}` | `400 Bad Request` |
| `DELETE /api/fotos/2` | — | `204 No Content`, sin cuerpo |
| `GET /api/fotos/2` después de eliminar | — | `404 Not Found` |
| `DELETE /api/fotos/2` después de eliminar | — | `404 Not Found` |
| `POST /api/fotos` | `{"titulo":"Inundación","calificacion":5,"descripcion":"Plaza Batán y alrededores"}` | `201 Created` |
| `GET /api/error` | — | `500 Internal Server Error` |

#### Consulta de fotos

La consulta de la lista devuelve las dos fotos iniciales y el estado `200`. Si se consulta un ID inexistente, la API responde `404` con un mensaje.

![Postman muestra la lista de fotos y el estado 200](capturas/5.png)

![Postman muestra el estado 404 al consultar la foto 9](capturas/6.png)

#### Creación de fotos

El POST crea la foto Cerro Santa Ana y responde `201`. La consulta posterior confirma que aparece en la lista con ID `3`.

![Postman muestra la foto Cerro Santa Ana creada y el estado 201](capturas/7.png)

![Postman muestra las dos fotos iniciales y Cerro Santa Ana con ID 3](capturas/11.png)

Si el cuerpo no incluye un título, la API rechaza la creación con el estado `400`.

![Postman muestra el estado 400 y el mensaje de título obligatorio](capturas/8.png)

Otra prueba de creación incluye título, descripción y calificación. La consulta posterior muestra la nueva foto en el arreglo.

![Postman muestra la foto Inundación creada con título, descripción y calificación](capturas/19.png)

![Postman muestra las fotos Atardecer e Inundación y el estado 200](capturas/20.png)

#### Actualización parcial

La petición `PATCH /api/fotos/1` con `{"calificacion":0}` actualiza solo la calificación y conserva el ID, el título y la descripción. La respuesta incluye `"calificacion": 0`, incluso al enviar cero como valor.

![Postman muestra el estado 200 y la calificación actualizada a cero, conservando los demás campos](capturas/12.png)

La consulta posterior confirma que la calificación actualizada permanece en memoria.

![Postman muestra la foto 1 con calificación cero después del PATCH](capturas/13.png)

El PATCH responde `404` si la foto no existe y `400` si se envía un título vacío.

![Postman muestra el estado 404 al actualizar la foto 9](capturas/14.png)

![Postman muestra el estado 400 al enviar un título vacío mediante PATCH](capturas/15.png)

#### Eliminación de fotos

El DELETE de la foto `2` responde `204` sin cuerpo. Consultar esa foto o intentar eliminarla nuevamente devuelve `404`.

![Postman muestra el estado 204 y una respuesta vacía al eliminar la foto 2](capturas/16.png)

![Postman muestra el estado 404 al consultar la foto 2 después de eliminarla](capturas/17.png)

![Postman muestra el estado 404 al intentar eliminar una foto que ya no existe](capturas/18.png)

#### Manejo de errores

La ruta `/api/error` provoca un error para comprobar que el manejador responde `500` con el mensaje de error interno del servidor.

![Postman muestra el estado 500 de la ruta de error](capturas/9.png)

### Navegador

#### Consulta de fotos

Las rutas GET permiten consultar la lista completa y cada foto por su ID desde la barra de direcciones.

![El navegador muestra la lista con Atardecer y Malecón](capturas/1.png)

![El navegador muestra la foto 1, Atardecer](capturas/2.png)

![El navegador muestra la foto 2, Malecón](capturas/3.png)

#### Manejo de errores

La ruta de prueba también muestra el mensaje del manejador de errores al abrirla en el navegador.

![El navegador muestra el mensaje de error interno del servidor](capturas/4.png)

## Funcionamiento y estructura actual

La aplicación se mantiene en `src/server.js`, siguiendo el formato trabajado en clase. Express recibe las peticiones y las rutas consultan o modifican el arreglo `fotos`.

- **Consulta:** GET devuelve la lista o busca una foto por su ID con `find`.
- **Creación:** POST exige un título, asigna un ID y agrega la foto con `push`.
- **Actualización:** PATCH busca la foto y modifica únicamente los campos enviados. La comparación con `undefined` permite actualizar la calificación a `0`.
- **Eliminación:** DELETE obtiene la posición con `findIndex`, elimina la foto con `splice(indice, 1)` y responde con `res.status(204).end()`.

El middleware `express.json()` permite leer los cuerpos JSON. Las rutas responden `400` o `404` según la validación, y el manejador de errores se coloca después de ellas para responder ante errores inesperados.

El contador `siguienteId` se inicializa una sola vez, después del arreglo, y aumenta con cada creación. Así, eliminar una foto no hace retroceder el contador. Para comprobarlo en una misma ejecución: crear la foto `3`, eliminar la `2` y crear otra foto; la nueva debe tener ID `4`.

```text
src/
└── server.js       Configuración de Express, datos y rutas
capturas/           Evidencias del taller
package.json        Dependencias y comando de desarrollo
package-lock.json   Versiones resueltas de las dependencias
README.md           Documentación del taller
```

## ¿Qué ocurre al reiniciar el servidor?

Las fotos se almacenan en el arreglo `fotos`, dentro de la memoria del proceso. Al detener el servidor con `Ctrl+C` y volver a ejecutar `npm run dev`, el código se ejecuta desde el inicio: vuelven las fotos Atardecer y Malecón con sus valores originales.

Por eso desaparecen las fotos creadas, se pierden las modificaciones y reaparecen las fotos eliminadas. El contador de IDs también vuelve a su valor inicial. Se puede comprobar repitiendo `GET /api/fotos` antes y después del reinicio.

Como el comando de desarrollo usa `node --watch`, guardar cambios en el código también puede reiniciar el servidor y restablecer el arreglo. Para conservar los datos entre reinicios se necesitaría almacenamiento persistente, como PostgreSQL, previsto para la sesión 3.

## Propuesta de organización si la API tuviera 30 rutas

Actualmente todo se mantiene en `src/server.js`, siguiendo el formato trabajado en clase. Si la API creciera a 30 rutas, la propuesta sería separar las rutas por recurso y distribuir las responsabilidades así:

```text
src/
├── server.js
├── routes/
│   └── fotos.routes.js
├── controllers/
│   └── fotos.controller.js
└── data/
    └── fotos.js
```

- `server.js`: configurar Express, registrar los middlewares, montar las rutas, colocar el manejador de errores después de ellas e iniciar el servidor.
- `routes/fotos.routes.js`: definir las rutas GET, POST, PATCH y DELETE con `express.Router` y asociarlas a sus funciones.
- `controllers/fotos.controller.js`: contener las funciones que buscan, crean, actualizan y eliminan fotos, junto con sus validaciones y respuestas.
- `data/fotos.js`: mantener el arreglo y la generación de IDs en memoria.

Los demás recursos seguirían la misma organización. Esta estructura es una propuesta para cuando aumente el número de rutas; todavía no se ha aplicado al proyecto.
