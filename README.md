# DominicanGo API

## Descripción

El backend de **DominicanGo** es la API encargada de procesar la información geográfica y cultural que alimenta el portal. Inspirado en la web oficial de turismo del gobierno, este motor actúa como la biblioteca central para proveer datos y visuales de alta calidad.

## Funcionalidades Principales

- **Biblioteca Turística:** Endpoints para consultar y gestionar destinos filtrables por provincia.
- **Relatos Comunitarios:** Manejo de blogs y reseñas aportadas por los exploradores.
- **Micro-servicio Visual:** Almacenamiento y procesamiento de imágenes optimizadas de los parajes nacionales.

## Tecnologías

### Core & Backend
- **Node.js & Express 5**
- **TypeScript**
- **Prisma ORM & PostgreSQL**

### Seguridad y Autenticación
- **Passport.js**
- **JWT (JSON Web Tokens)**
- **Express Session**

### Infraestructura y Servicios
- **MinIO (S3 Compatible)**
- **Sharp**
- **Nodemailer**
- **Zod**
- **CORS / UVid / Dotenv**
