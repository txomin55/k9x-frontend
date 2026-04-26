# Background Sync Testing

## Qué cubren los tests automáticos

Los tests unitarios cubren la lógica interna de la implementación:

- [src/utils/local-first/pending_tasks/commitOptimisticMutation.test.ts](src/utils/local-first/pending_tasks/commitOptimisticMutation.test.ts)
  - serializa la request al encolar
  - registra `Background Sync`
- [src/utils/service-worker/pending_tasks/backgroundSync.test.ts](src/utils/service-worker/pending_tasks/backgroundSync.test.ts)
  - si hay clientes abiertos, el SW manda `PROCESS_PENDING_TASKS`
  - si no hay clientes abiertos, el SW ejecuta el handler en background
- [src/utils/service-worker/pending_tasks/processPendingTasksInBackground.test.ts](src/utils/service-worker/pending_tasks/processPendingTasksInBackground.test.ts)
  - elimina tareas cuando el `fetch` responde `ok`
  - marca tareas como `failed` si hay error de red
  - ignora tareas legacy sin `request` serializada
- [src/utils/http/query-client.test.ts](src/utils/http/query-client.test.ts)
  - con la app abierta, el pipeline sigue siendo el actual

Estos tests sí validan la lógica nuestra.

No validan el comportamiento real del navegador:

- cuándo Chrome dispara realmente el evento `sync`
- soporte real de `Background Sync` en el navegador usado
- comportamiento con la app cerrada en móvil real

Para eso hace falta prueba manual.

## Ejecutar tests automáticos

```bash
pnpm exec vitest run \
  src/utils/service-worker/pending_tasks/backgroundSync.test.ts \
  src/utils/service-worker/pending_tasks/processPendingTasksInBackground.test.ts \
  src/utils/local-first/pending_tasks/commitOptimisticMutation.test.ts \
  src/utils/local-first/pending_tasks/pendingTasksRunner.test.ts \
  src/utils/http/query-client.test.ts
```

```bash
pnpm exec tsc --noEmit
```

## Prueba manual en Chrome o Chromium

### 1. Levantar la app

```bash
pnpm run build
pnpm run preview
```

### 2. Verificar que el service worker está activo

En Chrome DevTools:

- `Application > Service Workers`
- comprobar que `sw.js` está registrado y `activated`

### 3. Iniciar sesión

Hace falta sesión autenticada para que se active el modo local-first y se persistan tareas en IndexedDB.

### 4. Simular una mutación offline

No usar `DevTools > Network > Offline` para este caso.

Motivo:

- ese toggle afecta a la página
- las requests del service worker pueden seguir teniendo salida de red

Para simular falta de red real:

- apagar la Wi-Fi del equipo, o
- parar el backend/mock server

### 5. Generar una tarea pendiente

Con la red realmente caída:

- crear, editar o borrar una entidad que use cola offline

Luego comprobar en:

- `Application > IndexedDB > k9x-local-first > pending_tasks`

Cada tarea nueva debería incluir:

- `request.url`
- `request.method`
- `request.headers`
- `request.body`

### 6. Cerrar la app

Cerrar la pestaña por completo.

Esto valida el caso importante:

- no hay cliente abierto
- el trabajo lo debe ejecutar el SW cuando reciba `sync`

### 7. Recuperar la red

- volver a activar la Wi-Fi, o
- volver a levantar el backend/mock server

### 8. Forzar el evento sync en DevTools

En:

- `Application > Service Workers`

usar el campo `Sync` con este tag:

```txt
k9x-pending-tasks-sync
```

y pulsar `Sync`.

### 9. Verificar el resultado

Comprobar:

- que la request llegó al backend
- que la tarea desapareció de `IndexedDB > k9x-local-first > pending_tasks`

## Caso con la app abierta

También conviene validar el otro camino:

1. dejar la app abierta
2. encolar una tarea offline
3. recuperar la red
4. forzar `Sync` con el mismo tag

Resultado esperado:

- el SW detecta que hay cliente abierto
- manda `PROCESS_PENDING_TASKS`
- la app ejecuta `runReconnectPipeline()`
- se procesa la cola con el comportamiento actual

## Inspección adicional

Para observar eventos registrados por Chrome:

- `Application > Background services > Background sync`

Ahí se pueden grabar eventos de `Background Sync` y revisar su historial.

## Limitaciones reales

- `Background Sync` no tiene soporte universal
- el navegador decide cuándo lanzar `sync`
- no hay garantía de que ocurra exactamente en el instante en que vuelve la red

## Fuentes

- Chrome DevTools Application panel:
  - https://developer.chrome.com/docs/devtools/application
- Chrome DevTools Background services:
  - https://developer.chrome.com/docs/devtools/javascript/background-services/
- MDN `ServiceWorkerRegistration.sync`:
  - https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/sync
- MDN `SyncEvent`:
  - https://developer.mozilla.org/en-US/docs/Web/API/SyncEvent
- Chrome Workbox note sobre testing de background sync:
  - https://developer.chrome.com/docs/workbox/reference/workbox-background-sync
