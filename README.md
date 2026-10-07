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

## Login

Entrar y crear cuenta con correo y contraseña (`/login` y `/signup`, también en `/pt` y `/en`). Al crear la cuenta Supabase envía un correo con un enlace que pasa por `src/app/auth/confirm/route.ts`, activa la cuenta, inicia la sesión y lleva al mapa en el idioma de la persona. Arriba a la derecha del mapa aparece "Entrar" o la inicial de la persona con el botón de salir.

Al crear el proyecto de Supabase real, en Authentication:

1. **URL Configuration:** Site URL = la URL de la app (por ejemplo `https://kurious.earth`) y en Redirect URLs añade `https://kurious.earth/**` y `http://localhost:3000/**`.
2. **Email Templates > Confirm signup:** asunto "Activa tu cuenta de Kurious" y como cuerpo el contenido de `supabase/templates/confirmation.html` (sale en español, portugués o inglés según el idioma con el que se registró la persona).
3. **Providers > Email:** deja activado "Confirm email" y pon la longitud mínima de contraseña en 8.
4. **SMTP Settings:** el correo que trae Supabase solo envía a los miembros del equipo del proyecto y unos 2 correos por hora, así que para usuarios reales hace falta un SMTP propio (por ejemplo Resend o Brevo).

`supabase/config.toml` ya tiene todo esto para la base de datos local.

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
  components/        dibujos compartidos: araucaria, semilla, papel del mapa
  features/          código por funcionalidad: map/, auth/ (login); ideas/, trips/... llegarán
  i18n/              configuración de idiomas y Link/useRouter que conservan el idioma
  lib/supabase/      clientes de Supabase para navegador y servidor
  proxy.ts           idioma + refresco de la sesión en cada petición
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
- **Mapa:** MapLibre montado una vez desde un componente (`src/features/map/map-view.tsx`). De momento usa el estilo de OpenFreeMap; se cambiará por el estilo propio de Kurious con PMTiles en Cloudflare R2. El motor 3D (Three.js) se montará igual.
- **Idiomas:** español, portugués e inglés desde el principio. Un test comprueba que los tres ficheros de `messages/` tienen las mismas claves.
- **Alojamiento:** Cloudflare Workers con el adaptador OpenNext (`wrangler.jsonc`, `open-next.config.ts`).
- **Login:** correo y contraseña con Supabase Auth; los formularios son Server Actions y la sesión va en cookies (`@supabase/ssr`). Entrar con Google y "he olvidado mi contraseña" quedan para más adelante.
- **Pendiente:** service worker para funcionar sin conexión, proyecto de Supabase real, estilo propio del mapa, recuperar contraseña y entrar con Google.
- **Ojo con Cloudflare:** en Next.js 16 `src/proxy.ts` corre en Node.js, y OpenNext marca ese soporte en Cloudflare como experimental. Probado en local con `npx wrangler dev` (idioma, redirecciones y 404 funcionan); hay que volver a comprobarlo en el primer despliegue real.
