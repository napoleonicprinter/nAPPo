# Guía de Publicación: nAPPo Trails (Versión Web para PC y Tablet)

¡Hola! Has elegido el **Método A: Versión Web de Escritorio**. Esta es la opción más flexible, rápida y recomendada para que los usuarios puedan usar ambas versiones (Standard y Batallas) en computadoras (PC) y tablets sin necesidad de instalar una app nativa.

Hemos configurado y automatizado todo el sistema para que puedas generar y subir ambas versiones de forma extremadamente sencilla.

---

## 🚀 Paso 1: Generar los Archivos de Producción

Hemos creado un script inteligente que compila **ambas versiones** secuencialmente y las coloca en carpetas separadas para que no se sobrescriban.

En tu terminal (dentro de la carpeta del proyecto `d:\nAPPo_trails`), ejecuta:

```powershell
npm run build:all
```

### ¿Qué hace este comando?
1. Limpia cualquier compilación previa de las carpetas de salida.
2. Compila la **Versión Standard** (desactivando las unidades de batalla) y la guarda en la carpeta `dist-standard/`.
3. Compila la **Versión de Batallas** (activando las unidades de batalla) y la guarda en la carpeta `dist-battle/`.

Al finalizar, verás un mensaje de éxito de color verde indicando que ambas carpetas están listas.

---

## 🌐 Paso 2: Publicar en Internet con Netlify (Recomendado y Gratis)

Netlify es el servicio de hosting más rápido y fácil para publicar tus versiones web. Al tener dos versiones diferentes, lo ideal es crear **dos sitios web independientes** en Netlify.

### Para la Versión Standard:
1. Inicia sesión o crea una cuenta gratuita en [Netlify.com](https://www.netlify.com/).
2. Ve a la pestaña **"Sites"** (Sitios).
3. Desplázate hacia abajo hasta el área que dice **"Drag and drop your site folder here"** (Arrastra y suelta la carpeta de tu sitio aquí).
4. Arrastra y suelta la carpeta **`dist-standard`** desde tu explorador de archivos de Windows a esa zona.
5. ¡Listo! En segundos tu versión Standard estará en línea. Netlify te dará un enlace (ej. `nappo-standard.netlify.app`) el cual puedes personalizar.

### Para la Versión de Batallas:
1. En tu panel de Netlify, haz clic en **"Add new site"** (Añadir nuevo sitio) > **"Deploy manually"** (Desplegar manualmente).
2. Arrastra y suelta la carpeta **`dist-battle`**.
3. ¡Listo! En segundos tu versión de Batallas estará en línea bajo otro enlace (ej. `nappo-battle.netlify.app`).

---

## 📱 ¿Cómo funciona en PC y Tablet?

Al ser una aplicación web moderna y adaptativa:
* **En PC (Escritorio):** El diseño se adaptará de forma fluida a pantallas anchas, mostrando el panel del mapa, listas y el árbol lateral con total comodidad.
* **En Tablet:** Se adaptará perfectamente a la pantalla táctil de tu iPad o Tablet Android en orientación horizontal o vertical, ofreciendo una experiencia premium directamente en el navegador (Safari, Chrome, etc.).

---

## 🛠️ Probar localmente antes de subir

Si deseas probar la versión ya compilada localmente en tu PC antes de subirla a Netlify:
1. Tu servidor de desarrollo en tiempo real sigue corriendo en:
   **[http://localhost:5174](http://localhost:5174)**
2. Para probar una versión compilada de producción en tu navegador local, puedes iniciar un servidor de previsualización para la carpeta que desees. Por ejemplo, para previsualizar `dist-standard`:
   ```powershell
   npx vite preview --outDir dist-standard
   ```
