# VELYRA — Proyecto final de emprendimiento digital

**VELYRA** es una propuesta de marca de moda y belleza que combina una plataforma digital, una futura aplicación móvil y la visión de un espacio físico creativo. Su propósito es ayudar a las personas a explorar su estilo, aprender de maquillaje y moda, crear contenido y fortalecer su confianza mediante recomendaciones personalizadas.

Esta carpeta contiene la versión final del sitio web, una API académica opcional en Node.js y la documentación para explicar, probar y publicar el proyecto.

## 1. Qué incluye la entrega

| Requisito del proyecto | Implementación en VELYRA |
|---|---|
| Landing / inicio | Portada de marca, navegación y presentación del emprendimiento. |
| Catálogo | Moda, ropa, accesorios y bolsos; filtros, búsqueda, orden, favoritos, ficha rápida y bolsa demostrativa. |
| Contacto real | Formulario validado. Guarda mensajes en el backend cuando se ejecuta localmente; en GitHub Pages usa almacenamiento local de demostración. |
| Panel administrador | Inicio de sesión de demostración, consulta, exportación y eliminación de mensajes. |
| IA aplicada | Asistente conversacional Vely con respuestas de apoyo sobre moda, maquillaje, contenido y navegación. Se conecta al endpoint local; las respuestas son programadas, no generadas por un modelo externo. |
| Publicación | Preparado para GitHub Pages como sitio estático. El backend Node se ejecuta por separado. |
| Responsive | Diseño adaptable a celular, tableta y escritorio. |

## 2. Identidad visual

- **Estética:** lujo accesible, editorial, femenina, fresca y con detalles de fantasía.
- **Colores:** Vanilla Cream `#FFF7E6`, Blush Petal `#F7C8D3`, Rosewood `#B46A72`, Sage Leaf `#A8B58A`, Misty Sky `#A9B7C6`, Midnight Lagoon `#2D3A47`, lila y detalles plateados.
- **Tipografías:** Cormorant Garamond, Marcellus y Manrope.
- **Mascota:** Vely, conejita original de la marca. Se utiliza como personaje protagonista en momentos puntuales, no como decoración repetida en todas las secciones.
- **Interacciones:** sonidos opcionales por tipo de acción, destellos y burbujas al tocar, animaciones suaves, botones redondeados y transiciones.

La dirección visual toma inspiración general de páginas editoriales de moda y mundos de fantasía, sin reproducir logotipos, personajes ni composiciones de otras marcas o videojuegos.

## 3. Cómo abrir la página en TRAE

### Vista rápida (solo frontend)
1. Descomprime el ZIP.
2. Abre TRAE y selecciona **Open Folder**.
3. Selecciona la carpeta `VELYRA`.
4. Abre `index.html` y ejecútalo con la vista previa o Live Server.

### Ejecutar frontend + backend (recomendado para probar el formulario, chat y administrador)
1. Instala Node.js 18 o superior.
2. Abre una terminal en la carpeta `VELYRA`.
3. Ejecuta:

```bash
npm start
```

También puedes iniciar el servidor directamente con `node server.js`.

4. Abre `http://localhost:3000` en el navegador.
5. Para comprobar que la API está activa, visita `http://localhost:3000/api/health`.

No requiere instalar paquetes adicionales. El servidor utiliza módulos integrados de Node.js. Se recomienda Node.js 18 o superior.

## 4. Acceso de demostración al panel

- Dirección local: `http://localhost:3000/admin.html`
- Correo: `admin@velyra.co`
- Contraseña académica de demostración: `Velyra2026!`

El panel permite consultar, exportar y borrar mensajes. El backend guarda los mensajes en `data/messages.json`.

**Seguridad:** las credenciales predeterminadas son únicamente para pruebas académicas. Antes de desplegar un backend público, configura `ADMIN_EMAIL` y `ADMIN_PASSWORD` como variables de entorno, usa HTTPS, una base de datos y un sistema de autenticación robusto. No uses las credenciales de demostración en un negocio real.

## 5. Cómo funciona la parte técnica

### Frontend
- `index.html`: estructura y contenido de la página.
- `styles.css`: paleta, tipografías, diseño adaptable, animaciones y estados visuales.
- `script.js`: navegación, sonidos, filtros, búsqueda, favoritos, bolsa, pantallas de la app, chat, formulario y microinteracciones.
- `assets/`: marca y mascota Vely en SVG.

### Backend y datos
- `server.js`: servidor HTTP y API REST académica en Node.js.
- `data/products.json`: datos iniciales del catálogo.
- `data/messages.json`: mensajes recibidos mediante la API.
- `GET /api/products`: consulta del catálogo.
- `POST /api/contact`: valida y guarda mensajes.
- `POST /api/chat`: recibe una pregunta y devuelve una respuesta programada.
- `POST /api/admin/login`: valida el acceso y genera un token de sesión temporal.
- `GET /api/admin/messages`: consulta mensajes con token.
- `DELETE /api/admin/messages`: elimina mensajes con token.

Si se abre como sitio estático en GitHub Pages, las funciones de demostración utilizan `localStorage` del navegador. El formulario no envía un correo ni guarda información en una base de datos compartida en ese modo.

### IA
Vely demuestra el flujo de un asistente inteligente, con respuestas predefinidas para poder probarlo sin claves ni costos de servicios externos. Para convertirlo en IA generativa real se debe conectar un proveedor desde el backend y guardar su clave como variable de entorno. Nunca se debe incluir una clave privada en `script.js`.

### Aplicación móvil
La sección de la app es una demostración interactiva de varias pantallas: Inicio, Looks, Beauty y Contenido. **No es todavía una aplicación descargable**.

## 6. Catálogo y presupuesto de referencia

Los seis artículos del catálogo tienen precios ilustrativos en pesos colombianos (COP):

| Artículo | Precio de referencia |
|---|---:|
| Blusa Aura | $45.000 |
| Top Nocturne | $38.000 |
| Aretes Eclipse | $22.000 |
| Mini bag Sombra | $65.000 |
| Collar Órbita | $28.000 |
| Falda Amatista | $59.000 |

Los valores son precios de exhibición propuestos para el prototipo, no cotizaciones de proveedores, precios de compra ni disponibilidad real. Se contrastaron con referencias públicas de moda y accesorios en Colombia; pueden variar por marca, material, temporada y promociones.

**Presupuesto inicial de referencia: $300.000 COP.** Una distribución preliminar para presentar la idea sería:

| Uso propuesto | Valor | Participación |
|---|---:|---:|
| Compra de primeras piezas / muestra de catálogo | $210.000 | 70% |
| Empaques y presentación | $30.000 | 10% |
| Fotografías y contenido para redes | $30.000 | 10% |
| Reserva para imprevistos | $30.000 | 10% |
| **Total** | **$300.000** | **100%** |

Esta distribución es una propuesta de planeación, no un presupuesto cotizado. Antes de comprar inventario se deben solicitar precios mayoristas, cantidades mínimas, costos de envío y condiciones de cambio a proveedores colombianos. El presupuesto no se muestra como una sección promocional de la página: queda como parte de la propuesta empresarial.

## 7. Publicar el frontend en GitHub Pages

GitHub Pages publica archivos estáticos. Por eso puede publicar la página visual, pero **no ejecuta `server.js`**. Para la entrega básica del sitio:

1. Crea un repositorio en GitHub, por ejemplo `velyra`.
2. Sube el contenido de esta carpeta (incluyendo `index.html`, `styles.css`, `script.js` y `assets/`).
3. En GitHub abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`; guarda.
6. Espera la publicación y abre la URL que GitHub Pages indique.
7. Comprueba navegación, filtros, chat de demostración y formulario en un navegador nuevo.

Para que el formulario, chat y panel compartan datos en internet, despliega `server.js` en un servicio que ejecute Node.js y configura el frontend para consumir la URL HTTPS de esa API. GitHub Pages por sí solo no proporciona backend ni base de datos.

## 8. Requisito de Git: mínimo 15 commits

Esta entrega incluye un repositorio Git inicializado en la rama `main` con **15 commits reales**: un commit de importación de la versión base y 14 commits posteriores con ajustes concretos de configuración, pruebas, seguridad, accesibilidad, SEO y documentación. El historial refleja los cambios realizados al preparar esta entrega; no pretende reconstruir fechas ni commits de desarrollo anteriores.

Puedes comprobarlo con:

```bash
git log --oneline
git rev-list --count HEAD
```

El segundo comando debe mostrar `15`. Para continuar desarrollando, realiza nuevos commits por cada cambio real. Una secuencia de desarrollo futura podría ser:

1. `chore: crear estructura inicial de VELYRA`
2. `feat: construir navegación principal`
3. `feat: diseñar portada de marca`
4. `feat: agregar presentación del emprendimiento`
5. `feat: crear catálogo de moda`
6. `feat: implementar filtros por categoría`
7. `feat: agregar búsqueda y orden del catálogo`
8. `feat: implementar favoritos y bolsa demostrativa`
9. `feat: crear vista interactiva de la aplicación`
10. `feat: incorporar mascota y recursos de marca`
11. `feat: desarrollar chat de Vely`
12. `feat: agregar formulario de contacto`
13. `feat: crear panel de administración`
14. `feat: añadir API académica en Node`
15. `style: mejorar responsive, accesibilidad y animaciones`
16. `docs: documentar instalación y publicación`

Cada commit debe corresponder a cambios reales. Si el repositorio se crea cuando el desarrollo ya está terminado, realiza ajustes auténticos y commits incrementales; no fabriques fechas ni historial.

## 9. Comprobaciones técnicas

El proyecto incluye comandos de verificación en `package.json`:

```bash
npm run check
npm test
```

Las pruebas levantan una copia temporal del servidor y verifican la API, validaciones del formulario, autenticación del panel, cabeceras HTTP, respuesta HEAD y página 404. No modifican los mensajes de la carpeta de datos original.

## 10. Límites de esta versión

- El catálogo es una muestra; no tiene inventario ni compra real.
- La bolsa calcula un total ilustrativo; no cobra ni procesa pedidos.
- Vely usa respuestas programadas; no es todavía una IA generativa.
- La app móvil está representada mediante pantallas interactivas; no hay archivo instalable.
- El backend Node incluido sirve para demostración y pruebas locales. No es una infraestructura de producción.
- El sitio se puede publicar como frontend estático en GitHub Pages; el backend debe desplegarse por separado.

## 11. Referencias de precios consultadas

- [Mercado Lista — referencias de precios de blusas en Colombia](https://www.mercadolista.com/categoria/moda/mujer/ropa-mujer/blusas-mujer)
- [LuegoPago — catálogo de blusas y accesorios](https://luegopago.com/categorias/ropa-y-accesorios/blusas-ropa-y-accesorios)
- [ByBla — accesorios para mujer](https://www.bybla.com.co/collections/accesorios)
- [Gef — accesorios para mujer](https://www.gef.co/collections/mujeres-accesorios)

Los precios pueden cambiar; se consultaron como referencias de mercado, no como proveedores contratados por VELYRA.
