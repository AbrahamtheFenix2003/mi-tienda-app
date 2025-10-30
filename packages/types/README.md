# Documentación: flujo de tipos compartidos y comandos de desarrollo

Este documento explica los cambios realizados para el paquete de tipos compartidos @mi-tienda/types, por qué se compiló a dist y los comandos recomendados en desarrollo.

Qué se cambió
- Se configuró el paquete para exportar la versión compilada en dist en [`packages/types/package.json`](packages/types/package.json:17).
- Se añadió build (tsc) y un script de watch (dev:watch) que compila src → dist.
- Se ajustaron imports internos a ESM (.js) en [`packages/types/src/index.ts`](packages/types/src/index.ts:1) y archivos relacionados.

Por qué se hizo
- Node/Next con ESM y moduleResolution node16/nodenext requieren módulos JS o un campo `exports` que apunte a JS.
- Next no ejecuta TypeScript directo desde paquetes externos; compilar el paquete asegura que el frontend obtenga JS válido y las declaraciones `.d.ts`.

¿Borrar dist borra datos?
- No. dist contiene artefactos compilados (JS y .d.ts). No contiene base de datos ni datos del proyecto.
- Si borras dist, vuelve a compilar: `npm run build --workspace @mi-tienda/types`

Comandos principales (desde la raíz del monorepo)
- Compilar una vez:
  npm run build --workspace @mi-tienda/types

- Ejecutar watch (compilación automática al guardar):
  npm run dev:watch --workspace @mi-tienda/types

- Levantar frontend:
  npm run dev --workspace @mi-tienda/frontend

- Levantar backend:
  npm run dev --workspace @mi-tienda/backend

PowerShell: ejemplo con cd (Windows)
- Abrir PowerShell y ejecutar:
  cd C:\Users\USUARIO\Desktop\Abraham\07_proyectos en curso\mi-tienda-app
  npm run dev:watch --workspace @mi-tienda/types

Buenas prácticas y notas
- Mantén el `dev:watch` en una terminal separada. Para detenerlo usa Ctrl+C.
- El watch usa `tsc -w` y recompilará sólo archivos cambiados (bajo consumo). Si notas lentitud, activa `"incremental": true` en el tsconfig.
- Si el frontend no detecta cambios del paquete compilado, reinicia `next dev`.

Recuperar si algo falla
- Recompilar: `npm run build --workspace @mi-tienda/types`
- Borrar cache Next y reiniciar: eliminar `apps/frontend/.next` y `npm run dev --workspace @mi-tienda/frontend`

Archivos relevantes
- [`packages/types/package.json`](packages/types/package.json:17)
- [`packages/types/tsconfig.json`](packages/types/tsconfig.json:1)
- [`packages/types/src/index.ts`](packages/types/src/index.ts:1)
- [`packages/types/src/purchase.ts`](packages/types/src/purchase.ts:1)