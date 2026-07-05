# Reglas de visibilidad de editar/eliminar

Reglas para mostrar/ocultar los botones de editar y eliminar de competición,
stage y evento según su estado.

## Competición

- **Editar**: oculto si `status === FINISHED`.
- **Eliminar**: visible solo si `status === CREATED`.

Utils: `canEditCompetition`, `canDeleteCompetition` en `ui/app/src/utils/competition.ts`.

## Stage

- **Editar**: oculto si `status === FINISHED`.
- **Eliminar**: visible solo si `status === CREATED`.

Utils: `canEditStage`, `canDeleteStage` en `ui/app/src/utils/stage.ts`.

## Evento

- **Editar**: oculto si la fecha `dateTo` (timestamp UTC) del stage al que pertenece ya ha pasado (`Date.now() > stageDateTo`), independientemente del estado del evento.
- **Eliminar**: oculto si `status === STARTED` o `status === FINISHED` (visible solo si `status === CREATED`).

Utils: `canDeleteEvent`, `canEditEvent` en `ui/app/src/utils/event.ts`.

## Detalle de colección (`my/collections/$id`)

Al día siguiente del `dateTo` (timestamp UTC) del stage al que pertenece el
evento de la colección, se deshabilitan todos los campos/acciones **excepto
el selector de competidor**:

- Tarjeta amarilla (`YellowCardDialog`) y tarjeta roja (`RedCardDialog`): trigger deshabilitado.
- Botón "No presentado" (`NOT_PRESENTED`).
- Inputs de puntuación por ejercicio/juez (`CollectionExerciseScore`).

El selector de competidor (`AtomSelect` de competidores) permanece siempre
habilitado.

Util: `isDayAfterStageDateTo(stageDateTo)` en `ui/app/src/utils/stage.ts`.
Aplicado en `ui/app/src/components/routes/my/collections/$id/obdx/ObdxCollectionDetail.tsx`,
que resuelve `stageDateTo` buscando en `getCachedCompetitions()` el stage cuyo
`events` contiene el id del evento de la colección.

**Limitación conocida**: `getCachedCompetitions()` solo se rellena para
organizadores (`refreshCompetitionsSnapshot` solo llama a
`/secured/competitions` si `isOrganizer()`). Para un juez sin ese caché
poblado, `stageDateTo` será `undefined` y el bloqueo no se aplica — no hay
endpoint accesible a jueces que exponga el `dateTo` del stage a día de hoy.
Si se requiere bloquear también para jueces, hace falta exponer `stageId`/`dateTo`
en `/secured/events/:id` o en las respuestas de `collection-crud`.
