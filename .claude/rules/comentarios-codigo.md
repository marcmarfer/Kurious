# Comentarios en el código

**Por defecto: cero comentarios.** El código se tiene que entender por sí solo.

## No escribas

- Comentarios que explican **qué** hace el código. Nunca.
- JSDoc que repite el nombre de la función (`/** Activates X */` sobre `activateX()`).
- Comentarios de bitácora del cambio: `// nuevo`, `// añadido`, `// modificado`,
  `// antes esto era X`, `// fix`. Eso va en el commit o en la PR.
- Código comentado "por si acaso". Si no se usa, se borra (git lo guarda).
- Separadores decorativos (`// ======`, banners ASCII).
- La misma explicación repetida en varios archivos.

## Únicas excepciones

- **Documentación real**: el contrato de un módulo que alguien tiene que leer
  para usarlo sin abrir la implementación.
- Algo **muy concreto** que de verdad no se puede deducir del código: el motivo
  de un workaround contra el navegador, un orden que importa y no se ve.

Ante la duda: **no lo pongas**. Si crees que hace falta un comentario, casi
siempre lo que hace falta es un nombre mejor, una función más pequeña o un
early return. Si aun así el _porqué_ importa, va en el mensaje del commit.

## Al editar código existente

- **No añadas** comentarios a código que ya estaba.
- **No borres** los comentarios que ya hay salvo que el cambio los deje falsos.

## SQL

Lo mismo en las migraciones: nada de separadores `-- ----` ni comentarios que
repiten la sentencia. Una migración ya aplicada solo se toca para quitar
comentarios; el esquema nunca.
