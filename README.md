# Voces del Sur · Encuesta "Venidos y Quedados"

Web 100 % gratuita: **GitHub Pages** (hosting) + **Supabase** (base de datos PostgreSQL, plan Free).

## Estructura
- `index.html` + `app.js` — encuesta paso a paso con preguntas condicionales
- `resultados.html` — resultados agregados y anónimos
- `schema.sql` — tabla, seguridad (RLS) y función de resumen
- `config.js` — URL y clave pública de Supabase
- `style.css`, `logo.png`

## Puesta en marcha

### 1. Base de datos (Supabase)
1. Crear cuenta en https://supabase.com y un proyecto nuevo (plan Free).
2. Ir a **SQL Editor → New query**, pegar todo `schema.sql` y ejecutar.
3. Ir a **Project Settings → API** y copiar la **Project URL** y la **anon public key**.
4. Pegarlas en `config.js`.

### 2. Publicar (GitHub Pages)
1. Crear un repositorio público en GitHub (ej. `voces-del-sur`) y subir todos estos archivos.
2. **Settings → Pages → Source: Deploy from a branch → `main` / root → Save**.
3. En 1 o 2 minutos queda en `https://TU-USUARIO.github.io/voces-del-sur/`.

## Ver los datos crudos
En Supabase: **Table Editor → respuestas**. Exportá a CSV con el botón *Export*.
El público solo puede enviar respuestas y ver resultados agregados; no puede leer respuestas individuales.

## Notas
- Supabase Free pausa proyectos tras 7 días sin actividad: entrá al panel de vez en cuando para reactivarlo.
- La `anon key` es pública por diseño. No uses nunca la `service_role key` en el sitio.
