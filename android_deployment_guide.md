# Guía de Publicación: Android Studio (AAB Bundles)

Para generar archivos **Android App Bundle (.aab)** firmados para ambas versiones (Standard y Battle Maps) utilizando un solo código base, hemos simplificado el flujo de trabajo usando comandos automatizados.

Capacitor sincroniza los archivos web de la carpeta que le indiques hacia el proyecto de Android Studio (`android/app/src/main/assets/public`). Como tienes dos versiones, hay que alternar los archivos antes de generar cada "App Bundle".

---

## 🛠️ Paso 1: Configurar las Dos Aplicaciones en Google Play (Importante)

Si vas a publicar ambas versiones como **dos aplicaciones distintas** en Google Play, *deben tener distinto `applicationId`*.

1. Abre `android/app/build.gradle` en Android Studio o tu editor.
2. Busca la línea `applicationId "com.nappo.trails.app"`.
   * Para la versión Standard, déjalo como `"com.nappo.trails.app"`.
   * Para la versión de Batallas, cuando vayas a compilarla, deberás cambiarlo temporalmente a `"com.nappo.trails.battle"` (o el ID que prefieras).
   
*(Si solo es para pruebas internas y vas a sobreescribir la misma app en tu teléfono, no necesitas cambiar el `applicationId`)*.

---

## 🛠️ Paso 1: Generar las dos versiones locales

Sigue estos pasos antes de abrir Android Studio:

1. **Construye los archivos web locales:**
   Asegúrate de haber generado las carpetas `dist-` ejecutando:
   ```powershell
   npm run build:all
   ```

2. **Inyecta las versiones a sus respectivos Flavors:**
   Hemos creado un script que sincroniza los plugins nativos y envía cada versión a su carpeta nativa correspondiente (`free` para Standard, `paid` para Batallas). En tu terminal ejecuta:
   ```powershell
   npm run sync:android
   ```
   *Esto evitará que los archivos se mezclen en la carpeta principal compartida de Android.*

---

## 📦 Paso 2: Generar los Bundles en Android Studio

Como tienes Product Flavors, el proceso dentro de Android Studio es ahora muy sencillo y directo.

1. Abre Android Studio (puedes ejecutar `npx cap open android`).
2. Ve al menú superior: **Build > Generate Signed Bundle / APK...**
3. Selecciona **Android App Bundle** y usa tu Keystore.
4. Cuando te pregunte por el **Flavor/Build Variant**, verás que tienes opciones como:
   - `freeRelease` (Esta es tu versión **Standard** "nAPPo Trails Free").
   - `paidRelease` (Esta es tu versión de **Batallas** "nAPPo Trails").
5. ¡Puedes seleccionar ambas (usando Ctrl o Shift) o generar una a la vez!
6. Android Studio te preguntará por el **"Destination Folder"** (normalmente lo deja por defecto en `nAPPo_trails/android/app`).
7. Android Studio usará el `applicationIdSuffix` y el `app_name` que ya tienes definidos en `build.gradle` para crear dos aplicaciones completamente separadas listas para Google Play.

### ¿Dónde se guardan los archivos .aab generados?

Una vez que Android Studio termine, te mostrará una notificación en la esquina inferior derecha. Si haces clic en **"Locate"**, te abrirá directamente la carpeta. 

Por defecto, si elegiste la ruta predeterminada, los archivos se guardarán separados por flavor en:
- **Standard (Free)**: `android/app/free/release/app-free-release.aab`
- **Batallas (Paid)**: `android/app/paid/release/app-paid-release.aab`
