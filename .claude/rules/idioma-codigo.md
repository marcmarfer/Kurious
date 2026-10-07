# Idioma: código en inglés, producto en español, portugués e inglés

## El código, en inglés

Todo lo que se escribe para la máquina va en inglés, sin mezclar:

- Nombres de variables, funciones, componentes, tipos e interfaces.
- Nombres de ficheros y de carpetas (`map-view.tsx`, no `vista-mapa.tsx`).
- Claves de objetos y de `messages/*.json`, nombres de tablas, columnas y
  políticas, y los valores de dominio (`'fire' | 'up' | 'down'`,
  `'owner' | 'editor' | 'guest'`).
- Rutas (`/login`, `/trips`) y parámetros.

Nada de espanglish (`viajeId`, `getIdeas` mezclado con `votarIdea`).

## El producto, en tres idiomas

Lo que lee la persona va en español primero, con sus tildes, y con la misma
clave en `messages/es.json`, `messages/pt.json` y `messages/en.json`
(`src/i18n/messages.test.ts` lo comprueba):

- Textos de la interfaz: títulos, botones, etiquetas, vacíos, errores.
- Los textos que genera la app para la persona (fechas, "hace 6 días").
- Los correos de Supabase (`supabase/templates/`).

Nunca un texto de cara a la persona escrito a mano en un componente.

## Frontera

El punto de traducción es la llamada a `t()`. La lógica maneja identificadores
en inglés; un valor como `'fire'` se guarda así y se muestra con su texto
traducido.
