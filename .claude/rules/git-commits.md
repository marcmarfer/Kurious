# Git: no commitear sin permiso

**No hagas `git commit` ni `git push` hasta que se pida explícitamente.**

Terminar una tarea no es permiso para commitearla, y un «hazlo» o «tira adelante»
sobre el trabajo tampoco lo es.

- Deja los cambios en el árbol de trabajo y di qué has tocado.
- Si te parece buen momento para un commit, **ofrécelo** y espera respuesta.

Lo mismo para `git revert`, `git reset --hard`, `git push --force`, crear o borrar
ramas y mergear.

## Cuando sí se pide

«Súbelo», «publica» o `/publish`: sigue el skill `.claude/skills/publish/SKILL.md`
(de momento commit directamente en `main` y push). El formato del commit está ahí:
en inglés, una línea `[Feature] …` o `[Fix] …`, sin `Co-Authored-By`, y el _porqué_
en el cuerpo del commit, no en comentarios dentro del código.
