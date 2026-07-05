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
