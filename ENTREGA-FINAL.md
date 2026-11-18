# VELYRA — Guion breve para presentar el proyecto

## Idea de negocio
VELYRA es una plataforma digital y una propuesta de espacio físico que conecta moda, belleza, aprendizaje, creación de contenido y confianza personal. Su aplicación futura utilizará recomendaciones personalizadas para ayudar a cada persona a descubrir looks, maquillaje e ideas creativas de acuerdo con sus gustos.

## Necesidad que busca atender
Muchas personas quieren explorar su estilo, pero no siempre saben por dónde empezar, cómo combinar prendas, qué técnicas de maquillaje probar o cómo crear contenido visual. VELYRA propone reunir inspiración, orientación y experiencias prácticas en un mismo universo.

## Público al que se dirige
Personas interesadas en moda, maquillaje, tendencias, expresión personal y creación de contenido, especialmente jóvenes que buscan explorar su identidad y aprender de manera cercana.

## Propuesta de valor
- Catálogo curado de moda con precios de referencia en pesos colombianos.
- Asistente Vely para orientar sobre moda, belleza, contenido y uso de la plataforma.
- Vista interactiva de la futura aplicación: Inicio, Looks, Beauty y Contenido.
- Visión de un espacio físico con asesorías, pantallas interactivas y zonas para crear contenido.
- Identidad visual cálida, editorial y fantástica, con una mascota propia.

## Cómo explicar la demostración técnica
La página está construida con HTML, CSS y JavaScript. Para demostrar una estructura de frontend, backend, datos y API se incluye un servidor académico en Node.js. El formulario envía mensajes a la API y estos se guardan en un archivo JSON; el chat consulta un endpoint que devuelve respuestas programadas; el panel de administración permite iniciar sesión y revisar los mensajes. Si solo se publica en GitHub Pages, se conserva la demostración frontend y el almacenamiento local del navegador, porque Pages no ejecuta Node.js.

## Demostración sugerida (3–5 minutos)
1. Presentar la portada y explicar la identidad visual.
2. Mostrar el catálogo: filtrar por categoría, buscar una pieza, ordenar por precio, guardar favoritos y añadir a la bolsa.
3. Abrir la sección de la app y cambiar entre Inicio, Looks, Beauty y Contenido.
4. Escribirle a Vely una pregunta sobre un look o una idea de contenido.
5. Enviar un mensaje desde el formulario.
6. Abrir `admin.html`, ingresar con el acceso de demostración y mostrar el mensaje recibido.
7. Explicar que la publicación estática se realiza en GitHub Pages y que el backend se despliega aparte si se requiere funcionamiento compartido en internet.

## Presupuesto inicial de referencia
$300.000 COP. Distribución preliminar: $210.000 para primeras piezas/muestra de catálogo, $30.000 para empaques, $30.000 para fotografía y contenido, y $30.000 de reserva. Es una proyección académica que requiere cotizaciones reales antes de comprar.

## Qué se desarrollaría después
- Conectar una IA generativa real mediante backend seguro.
- Incorporar una base de datos administrada e inventario real.
- Desplegar el backend y conectar el formulario a una bandeja compartida.
- Convertir la demostración de pantallas en una app móvil real.
- Integrar pagos y pedidos solo cuando exista operación comercial.

## Verificación del proyecto

La carpeta incluye un historial Git de 15 commits reales, además de `package.json` con comandos para iniciar y comprobar el proyecto. Para ejecutar las comprobaciones desde la carpeta raíz:

```bash
npm run check
npm test
```

Las pruebas se ejecutan sobre una copia temporal de los archivos del servidor.
