# 🎬 CineVault — App de Películas

Aplicación móvil/web híbrida para gestionar un catálogo personal de películas. Permite crear, editar y eliminar películas con soporte para pósters, trailers y soundtracks.

---

## 📱 Capturas

> _Agregar capturas de pantalla aquí_

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 17+ (Standalone Components) |
| UI | Ionic 7+ |
| Backend / BD | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Estado | Angular Signals |
| Formularios | Reactive Forms (tipado estricto) |

---

## ✨ Funcionalidades

- **Catálogo visual** — Grid responsivo con pósters en relación de aspecto 2:3
- **CRUD completo** — Crear, editar y eliminar películas con confirmación
- **Trailers** — Reproducción de trailers de YouTube y TikTok con iframe embed
- **Soundtrack** — Reproductor de audio flotante estilo Spotify (persiste entre pantallas)
- **Subida de archivos** — Upload de pósters e imágenes de audio directo a Supabase Storage
- **Splash screen** — Pantalla de bienvenida animada
- **Estado reactivo** — UI actualizada en tiempo real con Angular Signals
- **Actualizaciones optimistas** — La UI responde antes de confirmar con el servidor
- **Modo oscuro** — Soporte nativo vía `prefers-color-scheme`

---

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── mini-player/          # Reproductor de audio flotante
│   │   ├── file-upload-field/    # Componente de subida de archivos
│   │   └── splash-screen/        # Splash screen animado
│   ├── pages/
│   │   ├── movies/               # Catálogo principal
│   │   │   └── movie-detail/     # Modal de detalle con trailer
│   │   └── movies-form/          # Formulario crear/editar
│   ├── pipes/
│   │   └── safe-trailer.pipe.ts  # Transforma URLs de YouTube/TikTok a embed seguro
│   ├── services/
│   │   ├── movie.service.ts      # CRUD + estado reactivo con Signals
│   │   ├── audio.service.ts      # Reproductor de audio (Web Audio API)
│   │   └── storage.service.ts    # Upload a Supabase Storage
│   └── app.routes.ts
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

---

## 🗃️ Base de Datos (Supabase)

```sql
create table movies (
  id           uuid default gen_random_uuid() primary key,
  title        text not null,
  director     text not null,
  release_year int  not null,
  genre        text not null,
  synopsis     text,
  poster_url   text,
  trailer_url  text,
  audio_url    text,
  rating       numeric(3,1) check (rating >= 0 and rating <= 10),
  created_at   timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Políticas RLS

Todas las operaciones (SELECT, INSERT, UPDATE, DELETE) son públicas para uso en desarrollo. Se recomienda restringir con autenticación en producción.

### Buckets de Storage

| Bucket | Tipo | Uso |
|--------|------|-----|
| `movie-posters` | Público | Imágenes de pósters (JPG, PNG, WebP — máx. 5MB) |
| `movie-audio` | Público | Soundtracks (MP3, OGG, WAV — máx. 20MB) |

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/DavidCG2004/CineVault.git
cd cinevault
npm install
```

### 2. Configurar variables de entorno

Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'TU_SUPABASE_URL',
  supabaseKey: 'TU_SUPABASE_ANON_KEY',
};
```

### 3. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta el SQL de creación de tabla en el **SQL Editor**
3. Crea los buckets `movie-posters` y `movie-audio` en **Storage**
4. Aplica las políticas RLS correspondientes

### 4. Ejecutar en desarrollo

```bash
ionic serve
```

---

## 📦 Despliegue en Android

### Pre-requisitos

- Android Studio instalado
- JDK 17+

### Pasos

```bash
# Compilar y sincronizar
ionic build
ionic cap sync android

# Abrir en Android Studio
ionic cap open android
```

### Permisos requeridos (`AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
```

---

## 🏗️ Decisiones de Arquitectura

### Angular Signals sobre RxJS
Se usa `signal()` y `computed()` para el manejo de estado local por su simplicidad y rendimiento en componentes standalone, evitando la complejidad de Observables donde no es necesario.

### Actualizaciones optimistas
El `MovieService` actualiza el estado en memoria antes de confirmar con Supabase, lo que da una UX inmediata y fluida.

### `inject()` sobre constructores
Toda la inyección de dependencias usa `inject()` para mantener consistencia con el estilo moderno de Angular 17+ y reducir boilerplate.

### Private class fields (`#`)
Los miembros privados usan la sintaxis nativa de ECMAScript (`#campo`) en lugar de `private` de TypeScript, garantizando encapsulamiento real en runtime.

### `SafeTrailerPipe`
Centraliza la lógica de transformación y sanitización de URLs de YouTube/TikTok, siguiendo el principio de responsabilidad única y evitando duplicar `DomSanitizer` en los componentes.

### Web Audio API nativa
El reproductor de audio usa `HTMLAudioElement` directamente sin dependencias externas, suficiente para el caso de uso y compatible con Capacitor WebView en Android/iOS.

---

## 📋 Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `supabaseUrl` | URL del proyecto Supabase |
| `supabaseKey` | Clave anon/public de Supabase |

---

## 🛠️ Scripts disponibles

```bash
ionic serve           # Desarrollo web
ionic build           # Build de producción
ionic cap sync        # Sincronizar con plataformas nativas
ionic cap open android  # Abrir en Android Studio
```

---

## 📄 Licencia

MIT © 2025 — Tu Nombre
