# Taller #2 · Microservicios con Dockerfile y Docker Compose

Proyecto de práctica con tres microservicios en Node.js y Express y una base de datos MongoDB, cada uno en su propio contenedor. El servicio de cursos guarda los cursos en MongoDB, el de estudiantes mantiene una lista en memoria y el de reportes consulta a ambos por HTTP para generar un resumen. Todo se construye con Dockerfile y se orquesta con Docker Compose.

- **Autor:** Juan Diego Sotomayor.
- **Repositorio:** [jdsotomayorjimenez/taller2-2p-ddaw](https://github.com/jdsotomayorjimenez/taller2-2p-ddaw).
- **Documento de evidencias:** [Taller 2 - 2P - Juan Diego Sotomayor.pdf](docs/Taller%202%20-%202P%20-%20Juan%20Diego%20Sotomayor.pdf).

## Objetivo

- **Lab 3:** construir la imagen del servicio de cursos con un Dockerfile y ejecutarla con `docker run` en la red `red-academia`, conectada al MongoDB del Lab 2.
- **Lab 4:** levantar MongoDB, cursos y reportes con Docker Compose, comprobar la comunicación entre servicios, hacer el experimento de resiliencia y probar `docker compose watch`.
- **Reto:** agregar el microservicio `estudiantes` en el puerto 5000, con su Dockerfile y `.dockerignore`, integrarlo en `compose.yaml` y hacer que `/resumen` incluya `totalEstudiantes` consultando `http://estudiantes:5000`.

## Servicios

| Servicio | Puerto | Qué hace |
| --- | --- | --- |
| `mongodb` | interno (27017) | Base de datos del servicio de cursos, con volumen `datos-mongo` y healthcheck |
| `cursos` | 3000 | API que guarda y lista cursos en MongoDB |
| `estudiantes` | 5000 | API que lista estudiantes guardados en memoria |
| `reportes` | 4000 | Consulta a `cursos` y `estudiantes` por HTTP y devuelve un resumen |

## Requisitos y ejecución

Se necesita Docker Desktop (o Docker Engine con el plugin Compose v2). No hace falta instalar Node.js ni MongoDB en el equipo.

```bash
git clone https://github.com/jdsotomayorjimenez/taller2-2p-ddaw.git
cd taller2-2p-ddaw
docker compose up --build -d
docker compose ps
```

Docker Compose antepone el nombre de la carpeta a los contenedores, la red y el volumen; al clonar con el nombre del repositorio aparecerán como `taller2-2p-ddaw-cursos-1`. En las capturas la carpeta se llama `lab-microservicios`.

Otros comandos útiles:

```bash
docker compose logs -f cursos      # logs en vivo de un servicio
docker compose stop cursos         # detiene un servicio
docker compose start cursos        # lo vuelve a iniciar
docker compose watch               # sincroniza los cambios de cursos/ y reinicia el servicio
docker compose down                # elimina contenedores y red; el volumen se conserva
docker compose down -v             # también elimina el volumen con los datos
```

## Rutas

| Servicio | Método y ruta | Respuesta |
| --- | --- | --- |
| cursos | `GET http://localhost:3000` | `{"servicio":"cursos","estado":"funcionando"}` |
| cursos | `GET http://localhost:3000/cursos` | Lista de cursos guardados en MongoDB |
| cursos | `GET http://localhost:3000/cursos/demo` | `201`, crea el curso «Desarrollo Web» con 4 créditos |
| cursos | `POST http://localhost:3000/cursos` | `201`, crea un curso con el JSON recibido |
| estudiantes | `GET http://localhost:5000` | `{"servicio":"estudiantes","estado":"ok"}` |
| estudiantes | `GET http://localhost:5000/estudiantes` | Lista de 5 estudiantes en memoria |
| reportes | `GET http://localhost:4000` | `{"servicio":"reportes","estado":"ok"}` |
| reportes | `GET http://localhost:4000/resumen` | `totalCursos`, `totalCreditos`, `totalEstudiantes` y fecha de generación |

El estado de cursos dice `funcionando` porque así quedó después del ejercicio de `docker compose watch`; originalmente era `ok`.

Si `cursos` o `estudiantes` no responden, `/resumen` devuelve `503` con el mensaje `El servicio de cursos no responde` o `El servicio de estudiantes no responde`, y `reportes` sigue en ejecución.

### Variables de entorno

| Servicio | Variable | Valor en `compose.yaml` |
| --- | --- | --- |
| cursos | `MONGO_URL` | `mongodb://admin:secreto@mongodb:27017/academia?authSource=admin` |
| reportes | `CURSOS_URL` | `http://cursos:3000` |
| reportes | `ESTUDIANTES_URL` | `http://estudiantes:5000` |

Cada servicio también acepta `PORT`. Si no se define una URL, el código usa `localhost` como valor por defecto, lo que solo sirve al ejecutar el servicio fuera de Docker.

## Capturas

Las capturas siguen la misma numeración del documento de evidencias: `1.png` a `5.png` corresponden al Lab 3, `6.0.png` a `18.png` al Lab 4 y `19.0.png` a `28.png` al reto.

### Lab 3 · Imagen del servicio de cursos

#### Construcción de la imagen

`docker build -t cursos-api:1.0 ./cursos` ejecuta los cinco pasos del Dockerfile y `docker images` muestra la imagen `cursos-api:1.0`.

![Construcción de la imagen cursos-api:1.0 y listado de imágenes](capturas/1.png)

#### Ejecución en la red red-academia

El contenedor `cursos` se ejecuta en la misma red que `mongodb` y recibe `MONGO_URL` por variable de entorno. `docker ps` muestra ambos contenedores en ejecución y los logs confirman la conexión a MongoDB.

![docker run, docker ps y docker logs del contenedor cursos](capturas/2.png)

#### Pruebas en el navegador

La raíz responde con el estado del servicio y `/cursos/demo` crea el curso «Desarrollo Web».

![localhost:3000 responde servicio cursos y estado ok](capturas/3.png)

![localhost:3000/cursos/demo crea el curso Desarrollo Web](capturas/4.png)

`/cursos` lista «Desarrollo Web» y también «Redes», el curso insertado con `mongosh` en el Lab 2. Aparece porque el contenedor `mongodb` sigue usando el volumen `datos-mongo`.

![localhost:3000/cursos lista Redes y Desarrollo Web](capturas/5.png)

### Lab 4 · Orquestación con Docker Compose

#### Levantar todo con un comando

Primero se eliminan los contenedores del Lab 3 para liberar los puertos. `docker compose up --build -d` construye las imágenes de cursos y reportes, crea la red y el volumen del proyecto y espera a que MongoDB esté `Healthy` antes de iniciar cursos.

![docker rm -f cursos mongodb y construcción con docker compose up](capturas/6.0.png)

![Red, volumen y tres contenedores creados por Compose](capturas/6.1.png)

#### Estado de los servicios

`docker compose ps` muestra MongoDB `healthy`, cursos en el puerto 3000 y reportes en el 4000. MongoDB no publica su puerto: solo es accesible dentro de la red de Compose.

![docker compose ps con los tres servicios](capturas/7.png)

![docker compose logs de cursos conectado a MongoDB](capturas/8.png)

#### Pruebas

Se abre `/cursos/demo` tres veces y `/cursos` lista los tres cursos. «Redes» ya no aparece porque Compose crea su propio volumen, `lab-microservicios_datos-mongo`, que empieza vacío.

![Tercera creación del curso Desarrollo Web](capturas/9.png)

![Lista con tres cursos Desarrollo Web](capturas/10.png)

`/resumen` de reportes consulta a cursos usando `http://cursos:3000` y devuelve 3 cursos y 12 créditos.

![localhost:4000/resumen con totalCursos 3 y totalCreditos 12](capturas/11.png)

#### Experimento de resiliencia

Al detener solo el servicio de cursos, `/resumen` responde con un error controlado y reportes sigue respondiendo en su raíz.

![docker compose stop cursos](capturas/12.png)

![localhost:4000/resumen con el error El servicio de cursos no responde](capturas/13.png)

![localhost:4000 responde servicio reportes y estado ok con cursos detenido](capturas/14.png)

Al iniciar cursos de nuevo, el resumen vuelve a funcionar sin reiniciar reportes.

![docker compose start cursos](capturas/15.png)

![localhost:4000/resumen funcionando de nuevo](capturas/16.png)

#### Desarrollo con compose watch

Con `docker compose watch` activo, al cambiar en `cursos/index.js` el estado de `'ok'` a `'funcionando'` y guardar, Compose sincroniza el archivo y reinicia el contenedor.

![docker compose watch sincronizando y reiniciando cursos](capturas/17.png)

![localhost:3000 muestra el estado funcionando](capturas/18.png)

### Reto · Microservicio de estudiantes

#### Construcción con el nuevo servicio

`docker compose up --build -d` construye la imagen de estudiantes y recrea reportes con la nueva variable `ESTUDIANTES_URL`.

![docker compose up --build con el servicio estudiantes](capturas/19.0.png)

![Contenedores levantados después del build del reto](capturas/19.1.png)

#### Estado de los cuatro servicios

`docker compose ps` muestra MongoDB `healthy`, cursos en el 3000, reportes en el 4000 y estudiantes en el 5000.

![docker compose ps con los cuatro servicios](capturas/20.png)

![docker compose logs de estudiantes escuchando en el puerto 5000](capturas/21.png)

#### Servicio de estudiantes

![localhost:5000 responde servicio estudiantes y estado ok](capturas/22.png)

![localhost:5000/estudiantes lista cinco estudiantes](capturas/23.png)

#### Resumen con los totales

`/resumen` consulta a cursos y a estudiantes por su nombre de servicio y devuelve `totalCursos: 3`, `totalCreditos: 12` y `totalEstudiantes: 5`.

![localhost:4000/resumen con totalCursos, totalCreditos y totalEstudiantes](capturas/24.png)

#### Resiliencia con estudiantes

Al detener estudiantes, `/resumen` responde con un error controlado. Al iniciarlo de nuevo, vuelve a mostrar los tres totales sin reiniciar reportes.

![docker compose stop estudiantes](capturas/25.png)

![localhost:4000/resumen con el error El servicio de estudiantes no responde](capturas/26.png)

![docker compose start estudiantes](capturas/27.png)

![localhost:4000/resumen con los tres totales después de reiniciar estudiantes](capturas/28.png)

## Funcionamiento

- **Comunicación por nombre:** dentro de un contenedor, `localhost` es el propio contenedor. Docker resuelve el nombre de cada contenedor (Lab 3) o de cada servicio de Compose (Lab 4 y reto) como si fuera un dominio, por eso se usan `mongodb`, `cursos` y `estudiantes` en las URL.
- **Caché de capas:** los Dockerfile copian `package*.json` e instalan dependencias antes de copiar el código. Si solo cambia `index.js`, `npm install` se reutiliza desde caché.
- **Arranque ordenado:** cursos espera a que el healthcheck de MongoDB responda (`condition: service_healthy`). Reportes depende de cursos y estudiantes.
- **Persistencia:** los cursos viven en el volumen `datos-mongo` y sobreviven a `docker compose down`. Los estudiantes están en un arreglo en memoria, así que vuelven a los cinco iniciales cada vez que el contenedor se reinicia.
- **Fallo aislado:** reportes consulta cada servicio en un bloque `try/catch` separado. Si uno no responde, devuelve `503` con un mensaje que indica cuál falló y el resto del sistema sigue funcionando.

## Estructura

```text
cursos/
├── Dockerfile
├── .dockerignore
├── index.js        API de cursos con Express y Mongoose
└── package.json
estudiantes/
├── Dockerfile
├── .dockerignore
├── index.js        API de estudiantes con datos en memoria
└── package.json
reportes/
├── Dockerfile
├── .dockerignore
├── index.js        Resumen que consulta a cursos y estudiantes
└── package.json
capturas/           Evidencias de los labs y del reto
docs/               Documento de evidencias en PDF
compose.yaml        Orquestación de los cuatro contenedores
README.md           Documentación del taller
```
