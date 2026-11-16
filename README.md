# Laboratorio: Microservicios con Docker

Proyecto de práctica para la clase "Microservicios y contenedores".

| Servicio  | Puerto | Qué hace                                             |
|-----------|--------|------------------------------------------------------|
| mongodb   | (interno) | Base de datos del servicio de cursos              |
| cursos    | 3000   | API REST que guarda y lista cursos en MongoDB        |
| reportes  | 4000   | Consulta a "cursos" por HTTP y devuelve un resumen   |

## Requisito
Docker Desktop instalado y abierto (https://docs.docker.com/get-started/get-docker/).

## Levantar todo con Docker Compose
```bash
docker compose up --build -d
```
Prueba en el navegador:
- http://localhost:3000/cursos/demo  → crea un curso de ejemplo
- http://localhost:3000/cursos       → lista los cursos
- http://localhost:4000/resumen      → resumen generado por el servicio de reportes

## Modo desarrollo (recarga automática al guardar)
```bash
docker compose watch
```

## Experimento de resiliencia
```bash
docker compose stop cursos     # http://localhost:4000/resumen responde 503, pero reportes sigue vivo
docker compose start cursos
```

## Apagar y limpiar
```bash
docker compose down        # elimina contenedores y red (los datos quedan en el volumen)
docker compose down -v     # también borra el volumen de datos
```
