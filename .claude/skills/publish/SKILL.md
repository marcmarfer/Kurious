---
name: publish
description: Publica los cambios de Kurious desde el equipo de Santiago (comprobación, commit en inglés directamente en main y push). Úsalo cuando Santiago diga «súbelo», «publica», «publícalo» o escriba /publish.
argument-hint: "[tema del cambio]"
---

# Publicar en main

«Súbelo» es el permiso para todo el flujo de este archivo: no preguntes en cada paso, pero
para y avisa en cuanto algo no cuadre. Los commits salen con la identidad git de la máquina
(`marcmarfer`, que es la cuenta de Santiago).

De momento en Kurious no hay ramas ni worktrees: se commitea directamente en `main`, en la
carpeta principal. Las ramas y los worktrees volverán cuando Santiago lo diga.

## Dónde está cada cosa

`PRG/` es la carpeta madre (`..` desde la raíz del repo).

|                   | Kurious                                        |
| ----------------- | ---------------------------------------------- |
| Carpeta principal | `PRG/Kurious`                                  |
| Rama              | `main`                                         |
| Despliegue        | Aún no hay despliegue automático al hacer push |

Todo git con `git -C <principal> …` y rutas absolutas. Nunca `cd` a la carpeta principal salvo
para `npm run check`, que necesita el cwd ahí.

## Paso 1: comprobar

1. `git -C <principal> branch --show-current` tiene que ser `main`. Si no, para y avisa.
2. `git -C <principal> status --short`. Sin cambios ni commits pendientes de subir → no hay
   nada que publicar; dilo y para.
3. `git -C <principal> pull origin main`. Si falla o deja conflicto: **para**, no toques nada
   más y dile a Santiago qué archivos chocan. No resuelvas conflictos por tu cuenta.
4. `cd <principal> && npm run check`. Si falla, para y avisa.

## Paso 2: commit y push

1. `git -C <principal> add -A`
2. `git -C <principal> commit -m "<asunto>"`: en inglés, una línea `[Feature] …` (funcionalidad
   nueva) o `[Fix] …` (corrección) que describa el cambio; el porqué, si aporta, en el cuerpo.
   Sin `Co-Authored-By` ni líneas de sesión.
3. `git -C <principal> push -u origin main`. Si falla por red, reintenta hasta 4 veces
   (2 s, 4 s, 8 s, 16 s).

- **Nunca**: `checkout`, `restore`, `stash`, `reset`, `rebase`, `push --force`, crear o borrar
  ramas.

## Paso 3: comprobar que está desplegado

Kurious aún no se despliega solo al hacer push a `main`: sáltate este paso y dilo.

## Al terminar

Un mensaje corto a Santiago: qué se ha publicado (el asunto del commit) y lo que haya quedado
pendiente.
