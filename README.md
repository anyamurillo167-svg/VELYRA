# VELYRA

Proyecto web de moda con frontend estático y API Node.js independiente. La identidad visual y las pantallas de demostración se conservan; las funciones reales dependen de desplegar y configurar el backend.

## Requisitos

- Node.js 18 o superior.
- Git.
- Una clave de API de OpenAI para habilitar las respuestas generativas de Vely.
- Un servicio para desplegar el backend. GitHub Pages solo publica archivos estáticos; no ejecuta Node.js.

## Ejecutar localmente

1. Abre esta carpeta en una terminal.
2. Instala Node.js 18+ si aún no está instalado.
3. Copia `.env.example` a `.env`.
4. Define `ADMIN_EMAIL` y `ADMIN_PASSWORD` con valores propios. Para probar las respuestas programadas localmente, deja `DEMO_MODE=true`. Para probar la IA real, configura `OPENAI_API_KEY` y usa `DEMO_MODE=false`.
5. Ejecuta:

```bash
npm run check
npm test
npm start
```

Abre `http://localhost:3000`. El backend sirve también los archivos del frontend cuando se ejecuta localmente.

**Nunca publiques `.env`, claves API ni contraseñas.** La clave de OpenAI se configura solo en el entorno del servidor, nunca en `config.js` ni en JavaScript del navegador.

## Publicar el frontend en GitHub Pages

1. Publica el contenido de esta carpeta en tu repositorio.
2. Activa GitHub Pages para la rama y carpeta que contiene `index.html`.
3. Cuando el backend esté desplegado, abre `config.js` y asigna su URL HTTPS:

```js
window.VELYRA_API_URL = "https://TU-API.onrender.com";
```

4. Guarda y publica el cambio.
5. En el panel del backend, configura `CORS_ORIGINS` con el origen exacto de GitHub Pages, sin una ruta. Ejemplo:

```text
https://anyamurillo167-svg.github.io
```

Si tu sitio se publica bajo una ruta de proyecto, el origen sigue siendo el dominio anterior; no incluyas `/VELYRA/`.

## Variables privadas del backend

| Variable | Uso |
|---|---|
| `PORT` | Puerto que proporciona el hosting. |
| `ADMIN_EMAIL` | Correo privado del panel administrativo. |
| `ADMIN_PASSWORD` | Contraseña privada, larga y única. |
| `OPENAI_API_KEY` | Clave privada para la IA de Vely. |
| `OPENAI_MODEL` | Modelo de OpenAI; por defecto `gpt-4o-mini`. |
| `CORS_ORIGINS` | Lista de orígenes frontend autorizados, separados por comas. |
| `DATA_DIR` | Carpeta persistente donde se guardan los mensajes. |
| `DEMO_MODE` | Solo `true` activa explícitamente las respuestas programadas. En producción debe ser `false`. |

## Despliegue del backend

El archivo `render.yaml` prepara un servicio Node en Render y un disco persistente para `messages.json`. Antes de crear el servicio, revisa el plan y el costo del hosting: el disco persistente puede requerir un plan pago. No publiques datos reales de clientes hasta configurar el almacenamiento y las credenciales.

En Render, completa las variables privadas `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `OPENAI_API_KEY` y `CORS_ORIGINS`. El `CORS_ORIGINS` debe coincidir con el dominio de GitHub Pages. El endpoint de comprobación es `/api/health`.

El almacenamiento actual usa un archivo JSON. El disco persistente evita perder los mensajes al reiniciar el servicio, pero no es una base de datos multiusuario de alta disponibilidad. Para una tienda en producción conviene migrar a una base de datos administrada.

## Funciones y límites actuales

- Catálogo, filtros, búsqueda, favoritos y bolsa: demostración en el navegador; no administra inventario ni cobra.
- Vely: usa la API de OpenAI si `OPENAI_API_KEY` está configurada. Si no hay clave y `DEMO_MODE=false`, responde con un error claro y no simula ser IA.
- Formulario: confirma el envío únicamente si el backend lo guarda.
- Administración: requiere autenticación del backend. Ya no existe una contraseña pública de demostración ni acceso local falso.
- App móvil: son pantallas interactivas de muestra, no una aplicación instalable.
- Contactos: se guardan en `data/messages.json` (o `DATA_DIR`); limita el acceso al panel y protege el almacenamiento.

## API

- `GET /api/health`
- `GET /api/products`
- `POST /api/chat`
- `POST /api/contact`
- `POST /api/admin/login`
- `GET /api/admin/messages` (requiere token)
- `DELETE /api/admin/messages` (requiere token)
- `POST /api/admin/logout` (requiere token)

## Git e historial

El ZIP entregado conserva 15 commits reales. Compruébalo con:

```bash
git rev-list --count HEAD
git log --oneline
```

Los cambios de esta actualización se registran como un nuevo commit. Continúa realizando commits por cambios reales y pequeños.

## Verificación

```bash
npm run check
npm test
```
