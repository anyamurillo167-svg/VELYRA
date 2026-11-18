# VELYRA — estado actualizado del proyecto

## Qué está implementado en el código
- Frontend adaptable en HTML, CSS y JavaScript.
- Catálogo de demostración con búsqueda, filtros, favoritos y bolsa local.
- Backend Node.js con endpoints de salud, productos, contacto, chat y administración.
- Integración de Vely con la API de OpenAI mediante una clave privada de entorno.
- Respuestas programadas disponibles solo cuando `DEMO_MODE=true`.
- Formulario que confirma el envío únicamente cuando el servidor lo recibe.
- Panel de administración que requiere credenciales configuradas en el backend.
- CORS configurable para conectar GitHub Pages con el backend.

## Qué falta para que funcione en internet
1. Crear el servicio de backend en un hosting y revisar el costo, especialmente el almacenamiento persistente.
2. Configurar `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `OPENAI_API_KEY` y `CORS_ORIGINS` como variables privadas.
3. Configurar `DATA_DIR` en un disco persistente para no perder los mensajes al reiniciar.
4. Cambiar `window.VELYRA_API_URL` en `config.js` por la URL HTTPS real del backend.
5. Publicar la actualización del frontend en GitHub Pages y probar chat, contacto y administración.

## Qué sigue siendo demostración
La bolsa no procesa pagos ni pedidos; el catálogo no tiene inventario sincronizado; las pantallas móviles no son una app instalable. El archivo JSON es almacenamiento sencillo, no una base de datos de producción.

## Pruebas locales
Ejecutar `npm run check` y `npm test`. La suite comprueba el flujo de API, validaciones, autenticación, CORS y que el servidor no finja tener IA ni acceso administrativo configurados cuando faltan las credenciales.
