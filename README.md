# Kurious

Stay kurious. App web (PWA) para que un grupo pase de la lluvia de ideas al plan del viaje, todo en un mapa.

## Requisitos

- Node.js 22 (`.nvmrc`)
- Docker, solo si quieres la base de datos de Supabase en local

## Arrancar

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
npm run dev
```

Abre http://localhost:3000. Sin las claves de Supabase la app funciona igual, solo que sin login.

### Base de datos en local (opcional)

```bash
npm run db:start   # levanta Supabase en Docker y muestra la URL y la clave publishable
npm run db:reset   # aplica supabase/migrations y supabase/seed.sql desde cero
npm run db:types -- --local   # tipos de TypeScript de la base local
```

Copia la URL y la clave publishable que imprime `db:start` en `.env.local`. Sin `--local`, `npm run db:types` genera los tipos del proyecto real (`jykwfosbirblmhpihuvm`, requiere `npx supabase login`). En local los correos de Supabase (por ejemplo, el de activar la cuenta) no salen a internet: se ven en http://127.0.0.1:54324.

### Viaje de demo

`npm run db:reset` carga también `supabase/seed.sql`: el viaje "Brasil 2027" (12 ene – 1 feb, 5 etapas de Rio a Floripa, 14 ideas con votos y comentarios). Entra con cualquiera de estas personas, todas con la contraseña `kurious-demo-2027`:

- `marc@kurious.local` (creó el viaje)
- `laura@kurious.local`, `alex@kurious.local`, `julia@kurious.local`, `santiago@kurious.local`

Estas cuentas solo existen en la base local: el seed no se aplica nunca al proyecto real.

## Login

Entrar y crear cuenta con correo y contraseña (`/login` y `/signup`, también en `/pt` y `/en`). Al crear la cuenta Supabase envía un correo con un enlace que pasa por `src/app/auth/confirm/route.ts`, activa la cuenta, inicia la sesión y lleva a la app en el idioma de la persona. Con la sesión iniciada, `/` abre el último viaje (o `/trips/new` si aún no hay ninguno); sin sesión muestra la portada con el mapa y el botón "Entrar". Si alguien sin sesión abre un enlace de un viaje (por ejemplo, una idea), tras entrar vuelve a esa misma página.

Al crear el proyecto de Supabase real, en Authentication:

1. **URL Configuration:** Site URL = la URL de la app (por ejemplo `https://kurious.earth`) y en Redirect URLs añade `https://kurious.earth/**` y `http://localhost:3000/**`.
2. **Email Templates > Confirm signup:** asunto "Activa tu cuenta de Kurious" y como cuerpo el contenido de `supabase/templates/confirmation.html` (sale en español, portugués o inglés según el idioma con el que se registró la persona).
3. **Providers > Email:** deja activado "Confirm email" y pon la longitud mínima de contraseña en 8.
4. **SMTP Settings:** el correo que trae Supabase solo envía a los miembros del equipo del proyecto y unos 2 correos por hora, así que para usuarios reales hace falta un SMTP propio (por ejemplo Resend o Brevo).

`supabase/config.toml` ya tiene todo esto para la base de datos local.

## Pantallas

Todas las pantallas del viaje salen de los mockups v4 y son un solo árbol de componentes: en el móvil (PWA) llevan la barra de abajo, y desde 1024 px de ancho la barra lateral verde a la izquierda y paneles en lugar de hojas.

| Ruta                             | Pantalla                                                                    |
| -------------------------------- | --------------------------------------------------------------------------- |
| `/trips/new`                     | Crear un viaje (nombre y fechas)                                            |
| `/trips/[tripId]`                | Mapa: ideas y etapas, filtros por tipo, votos y globo 3D; `?idea=` la marca |
| `/trips/[tripId]/tree`           | Árbol del viaje: las ideas crecen por etapas según los votos; 2D, 3D, lista |
| `/trips/[tripId]/ideas/[ideaId]` | Idea: mapa, crecimiento, votos, enlace y comentarios                        |
| `/trips/[tripId]/plant`          | Plantar una idea: enlace, nombre, tipo, etapa, nota y sitio en el mapa      |
| `/trips/[tripId]/plan`           | Plan: de momento las etapas y un aviso de que llegará                       |
| `/trips/[tripId]/group`          | Grupo: personas del viaje y cerrar sesión                                   |

El crecimiento de una idea (semilla, brote, arbolito, araucaria y "en llamas" para la más votada) se calcula en Supabase, en la vista `trip_ideas`; votar, comentar y plantar son funciones y políticas de la base de datos que Next.js llama con la sesión de la persona.

## Scripts

| Script                        | Qué hace                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run dev`                 | Servidor de desarrollo                                                                               |
| `npm run build` / `npm start` | Build de producción y servirlo                                                                       |
| `npm run lint`                | ESLint                                                                                               |
| `npm run typecheck`           | Tipos de rutas de Next y TypeScript                                                                  |
| `npm run format`              | Prettier (ordena también las clases de Tailwind)                                                     |
| `npm test`                    | Tests unitarios con Vitest                                                                           |
| `npm run check`               | Lint, tipos, formato y tests unitarios (lo que hay que pasar antes de dar un cambio por terminado)   |
| `npm run test:e2e`            | Tests en navegador con Playwright: construye la app en `.next-e2e` con un Supabase falso y la prueba |
| `npm run preview`             | Build para Cloudflare Workers y prueba local                                                         |
| `npm run deploy`              | Publica en Cloudflare Workers (requiere `npx wrangler login`)                                        |

La CI de GitHub (`.github/workflows/ci.yml`) pasa lint, tipos, formato, tests, build y tests en navegador en cada push a `main` y en cada PR.

## Estructura

```
messages/            textos de la app: es (por defecto), pt y en, con las mismas claves
src/
  app/[locale]/      páginas; español sin prefijo, /pt y /en con prefijo
  app/auth/confirm/  recibe el enlace del correo de activación
  app/[locale]/trips/[tripId]/  pantallas del viaje; (tabs)/ son las que llevan la barra de abajo
  components/        piezas compartidas: dibujos de crecimiento, iconos, votos, avatar, tipo de idea
  features/
    auth/            login, sesión y cuenta
    trips/           datos del viaje (consultas, acciones, tipos, crecimiento) y la estructura con la barra
    map/             motor del mapa (MapLibre) y estilo de Kurious
    three-d/         carga y montaje del árbol y el globo 3D
    map-screen/      pantalla Mapa
    tree/            pantalla Árbol del viaje
    idea/            pantalla Idea
    plant/           pantalla Plantar
  i18n/              configuración de idiomas y Link/useRouter que conservan el idioma
  lib/supabase/      clientes de Supabase para navegador y servidor
  proxy.ts           idioma + refresco de la sesión en cada petición
public/vendor/kurious3d/  motor 3D ya compilado, con sus texturas
supabase/
  migrations/        cambios de la base de datos, en orden
  functions/         funciones de servidor (IA, búsqueda, pagos...)
  seed.sql           datos de prueba
  templates/         correos de Supabase (activar la cuenta)
tests/e2e/           tests en navegador; support/mock-supabase.mjs imita el login de Supabase
```

## Decisiones

- **React + Next.js 16 + TypeScript**, como PWA. Tailwind CSS 4 con la paleta de los mockups v4 en `src/app/globals.css`; Fraunces para títulos y Nunito para el resto.
- **Supabase** para todo el backend: Postgres con PostGIS, login, tiempo real, fotos y funciones de servidor. Next.js no lleva lógica de negocio. Esquema propuesto en el documento "Backend de Kurious".
- **Claves secretas** (Claude, Geoapify, pagos) solo en los secrets de las funciones de Supabase, nunca en variables `NEXT_PUBLIC_`.
- **Mapa:** MapLibre montado una vez desde un componente y quitado al desmontarlo (`src/features/map/trip-map.tsx`); los marcadores, la selección y el encuadre cambian por su API, sin volver a pintarlo con React. El estilo de Kurious (`src/features/map/kurious-style.ts`) pinta las teselas vectoriales de OpenFreeMap (esquema OpenMapTiles) con la paleta de los mockups: tierra crema, mar azul, bosque y hierba verdes, carreteras blancas y las principales en amarillo, textos en tinta con halo crema y relieve sombreado con el DEM terrarium de AWS. `NEXT_PUBLIC_MAP_STYLE_URL` permite cambiarlo por otro estilo. La portada sigue usando `map-view.tsx`.
- **3D:** el árbol del viaje y el globo salen del motor de los mockups, un bundle ya compilado en `public/vendor/kurious3d/` (`kurious3d.js` con Three.js dentro, licencia MIT, y las texturas en `tree/` y `globe/`). Su código fuente no está en este repositorio: para cambiarlo hay que recompilarlo desde el diseño y sustituir la carpeta. `src/features/three-d/` lo carga una sola vez, lo monta en un canvas y lo libera al salir.
- **Idiomas:** español, portugués e inglés desde el principio. Un test comprueba que los tres ficheros de `messages/` tienen las mismas claves.
- **Alojamiento:** Cloudflare Workers con el adaptador OpenNext (`wrangler.jsonc`, `open-next.config.ts`).
- **Login:** correo y contraseña con Supabase Auth; los formularios son Server Actions y la sesión va en cookies (`@supabase/ssr`). Entrar con Google y "he olvidado mi contraseña" quedan para más adelante.
- **Pendiente:** el análisis con IA de los enlaces al plantar (ahora solo se reconoce si es un vídeo, un mapa o una web), la pantalla Plan (pasar ideas a los días del viaje), el tiempo real (los votos y comentarios de otros se ven al recargar), invitar a gente al viaje, service worker para funcionar sin conexión, proyecto de Supabase real, servir el mapa con PMTiles propios, recuperar contraseña y entrar con Google.
- **Ojo con Cloudflare:** en Next.js 16 `src/proxy.ts` corre en Node.js, y OpenNext marca ese soporte en Cloudflare como experimental. Probado en local con `npx wrangler dev` (idioma, redirecciones y 404 funcionan); hay que volver a comprobarlo en el primer despliegue real.
