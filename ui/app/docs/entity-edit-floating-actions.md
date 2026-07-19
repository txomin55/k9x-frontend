# Edición de entidades: acciones flotantes

Patrón de UX para editar una entidad en su página de detalle (crear/editar/borrar
hijos + borrar la propia entidad), estrenado en **competición** (`/my/competitions/$id`).

Este documento recoge las **decisiones tomadas** para poder replicarlo en las
páginas de **stage** (jornada) y **event** (prueba/evento) más adelante.

> Referencia de implementación: `ui/app/src/routes/my/competitions/$id/index.tsx`,
> `.../$id/styles.css`, `components/routes/my/competitions/$id/stages-section/*`.

---

## Idea general

En modo edición, las acciones "de página" (añadir hijo, borrar entidad) y el toggle
ver/editar viven en un **stack flotante fijo abajo-derecha**. Las acciones "de fila"
(editar/borrar cada hijo) se mantienen dentro de la lista/tabla, pero **se apartan de
la esquina inferior derecha** para no quedar tapadas por el stack.

Stack flotante, de abajo hacia arriba (con el menú **abierto** y en **modo edición**):

```
              [ Eliminar <entidad> ]  (○🗑)   ← level-3, rojo, solo si es borrable
              [ Añadir <hijo>      ]  (○+)    ← level-2
                                      (○↩)    ← level-1: lápiz (ver→editar) / flecha atrás (editar→ver)
                                      (○⚙)    ← level-0: config/menú, SIEMPRE visible (abre/cierra el menú)
```

El **⚙️ config** (level-0) es el único siempre visible. Controla `menuOpen`
(mostrar/ocultar el resto del stack), independiente de `isEditing`:
- Cerrado → solo ⚙️.
- Abierto + no editando → ⚙️ + lápiz.
- Abierto + editando → ⚙️ + flecha atrás + añadir + eliminar.
- Pulsar ⚙️ en modo edición **oculta** lápiz/atrás + acciones pero **sigue editando**
  (formulario y acciones de fila siguen activos); volver a pulsar ⚙️ las muestra.

---

## Decisiones

### 1. Menú config + toggle ver/editar (`FloatingEditMenu`)

- Componente reutilizable `components/common/floating-edit-menu/FloatingEditMenu`
  (sustituye al antiguo `FloatingToggleCircle`, que se mantiene solo para los "+" de las
  listas: competiciones/jueces/perros, que NO son toggles).
- Renderiza dos círculos: **⚙️ config** (`config.svg`, level-0, siempre) y, cuando
  `menuOpen`, el **lápiz** (`pencil.svg`) / **flecha atrás** (`arrow-back.svg`) en level-1.
- Props: `editing`, `menuOpen`, `onMenuToggle`, `onEditToggle`, `configLabel`,
  `editLabel`, `viewLabel`. La página posee ambos signals (`isEditing`, `menuOpen`).
- aria del ⚙️: i18n `COMMON.FLOATING_MENU.OPTIONS`.
- Se muestra con `<Show when={canEdit<Entidad>(status)}>`.
- Las acciones (añadir/eliminar) se muestran con `isEditing() && menuOpen()`.

### 2. "Añadir <hijo>" flotante

- Sale **de la cabecera de la sección** y pasa a ser flotante, **justo encima del toggle**.
- Forma: **chip de texto a la izquierda + círculo con icono `+` a la derecha**
  (icono en círculo = intuitivo; texto fuera del círculo).
  - `plus.svg` tintado dentro de un span circular `--primary`.
  - El chip de texto va sobre `--surface` con `border-radius: --radius-full` y sombra,
    para que se lea sobre el contenido al hacer scroll.
- Implementado con `AtomDialog` **controlado** (`open={isCreating()}` + `onOpenChange`),
  usando `triggerClass` y **trigger de contenido plano** (nada de `AtomButton`/`CircleButton`
  como trigger → evita botones anidados y fallos de tap-target; ver memoria
  `atom-dialog-nested-button-trigger`).
- Solo visible en modo edición.

### 3. "Eliminar <entidad>" flotante (rojo)

- Sale del flujo (ya no es un botón al final de la página) y pasa a ser flotante,
  **encima de "Añadir <hijo>"**.
- Mismo lenguaje visual que "Añadir" pero el círculo es **rojo** (`--error`, `--text-inverted`),
  con icono `trash.svg`.
- Mantiene el flujo de confirmación con `ConfirmActionButton`.
  - Ojo: `ConfirmActionButton` **no** reenvía `triggerClass`. Se le pasan los hijos como
    **contenido plano** (chip + círculo) y se estila vía selector descendente
    (`.<pagina>__delete-... .atom-dialog__trigger ...`).
- Solo visible si `isEditing && canDelete<Entidad>(status)`.

### 4. Posicionamiento del stack (CSS)

Todos anclados a `right: calc(var(--unit-2) + var(--unit-05))` y apilados con
`--circle-size-md` + `--unit-1` de separación:

```css
/* toggle: right/bottom var(--unit-2) (componente FloatingToggleCircle) */

.<pagina>__add-child {            /* +1 nivel */
  bottom: calc(var(--unit-2) + var(--unit-05) + var(--circle-size-md) + var(--unit-1));
}
.<pagina>__delete-entity {        /* +2 niveles */
  bottom: calc(var(--unit-2) + var(--unit-05) + (var(--circle-size-md) + var(--unit-1)) * 2);
}
```

- El `+ var(--unit-05)` compensa el `margin: var(--unit-05)` que trae el `AtomButton`
  interno del FAB (si no, el círculo del FAB queda metido y los de arriba se ven
  desplazados a la derecha).

### 5. z-index

- Los tres flotantes llevan `z-index: var(--z-floating)` (=40).
- Motivo: la cabecera de `AtomTable` es `position: sticky; z-index: var(--z-sticky)` (=2)
  y, sin z-index, se pintaba **por encima** de los botones. `--z-floating` los deja
  sobre el contenido pero **por debajo** de overlays/diálogos (`--z-overlay` 50 /
  `--z-modal` 51), así un diálogo abierto los sigue tapando.
- Escala en `ui/library/src/assets/styles/sizes/primitives.css`:
  `--z-raised:1, --z-sticky:2, --z-floating:40, --z-overlay:50, --z-modal:51, --z-popover:60`.

### 6. Acciones de fila (no tapar con el stack)

- **Vista lista (cards):** las acciones del footer se alinean a la **izquierda**
  (`.stages-section__stages--actions { justify-content: flex-start }`), dejando libre
  la esquina derecha donde está el stack.
- **Vista tabla:** la columna de acciones va a la derecha por convención y **se deja así**.
  NO se encoge ni desplaza la tabla para librar el FAB: probamos `padding-right` en el
  contenedor y en móvil hacía que la tabla desbordara (`.atom-table__scroller { overflow:auto }`)
  y la columna de acciones se saliera del viewport → peor. **Decisión: se acepta que en
  pantallas estrechas el FAB pueda solaparse con las acciones de la tabla** (no compensa el
  apaño). Para editar/borrar sin estorbo está la **vista Lista**, con las acciones a la
  izquierda.

- **Las columnas de la tabla se muestran igual en vista y en edición** (se descartó ocultar
  columnas en edición). La tabla va siempre a ancho completo con sus columnas habituales.

### 6b. ⚠️ Reactividad de las celdas de tabla (`AtomTable`)

Las celdas de `AtomTable` se construyen dentro de un `createMemo` (`columns`). Ese memo
**solo se recomputa por sus dependencias rastreadas**. Si las acciones de fila dependen de
`props.isEditing`, hay que **leer `props.isEditing` dentro del memo** (y pasarlo por
parámetro a la función de acciones), o las celdas quedan **obsoletas** al alternar
vista/edición (síntoma: la fila muestra 🗑/✏ en modo vista).

```ts
const columns = createMemo(() => {
  const isEditing = props.isEditing;           // ← dependencia explícita
  ...
  cols.push({ id: "actions", cell: (info) => rowActions(info.row.original, isEditing) });
  return cols;
});
```

La vista **lista** no sufre esto porque renderiza las acciones directamente en JSX
(`<Index>` + `cardActions(stage())`), donde Solid ya rastrea `props.isEditing`.

### 7. Scroll: no saltar arriba al abrir editores

- Los editores usan `useSearchParam` (query param) para abrir/cerrar.
- La navegación reseteaba el scroll arriba. Fix: `resetScroll: false` en las llamadas a
  `navigate` de `useSearchParam` (`utils/search-params/useSearchParam.ts`), tanto en
  `useSearchParam` como en `useSearchParamList`. Es el comportamiento correcto para
  params de estado/filtros en general.

### 8. Iconos e i18n

- Iconos nuevos en `ui/app/src/assets/miscelaneous/`: `arrow-back.svg`, `plus.svg`.
  - Son **stroke-based** (`fill:none; stroke:#fff`) para que funcione el modo `tinted`
    de `AtomSvgIcon` (usa `mask-image` + `currentColor`).
  - `trash.svg` ya existía y se reutiliza.
- Tamaño de icono dentro del círculo: `--icon-size-lg` (igual que el FAB).
- Clave i18n añadida: `MY.COMPETITIONS.STAGES_SECTION.ADD_STAGE` ("Añadir prueba" / "Add trial")
  en `static/locales/{es,en}/translation.json`. Para stages/events habrá que crear las
  claves equivalentes (`ADD_...`).

### 9. Padding inferior de página

- `.page` ya tiene `padding-bottom: calc(var(--unit-10) + var(--unit-3))`. Sirve para el
  segmented control flotante (centrado abajo en móvil) y un FAB. Con el stack de 3 botones
  puede quedarse algo corto según viewport; de momento no se ha subido. Si en stages/events
  molesta, valorar `padding-bottom` extra **solo en modo edición** (clase modificador en el
  contenedor de página) en vez de global.

---

### 10. CSS compartido (`floating-actions.css`)

Los estilos del stack están extraídos en `ui/app/src/assets/styles/floating-actions.css`
(importado en `app.tsx`), NO duplicados por página. Clases genéricas:

- `.floating-action` + `.floating-action--level-1` / `--level-2` (posición fija, z-index,
  animación de entrada; nivel 1 = añadir, nivel 2 = eliminar).
- `.floating-action__trigger` — sirve para un `<button>` plano, para el `triggerClass` de un
  `AtomDialog`, y (vía `.floating-action .atom-dialog__trigger`) para el trigger interno de
  `ConfirmActionButton`.
- `.floating-action__label` (chip de texto) y `.floating-action__circle`
  (+ `--danger` para el rojo de eliminar).
- Estado `:disabled` del trigger (círculo apagado) — usado por "Añadir ejercicio" sin jueces.

Competición, stage y event usan estas clases; ya no hay CSS flotante por página.

### 11. Página de event (varias secciones)

`event` tiene `AtomTabs` (Jueces / Ejercicios / Competidores; Configuración es inline) y
**cada tab se desmonta al no estar activo** (Kobalte). Por eso:

- El **"Añadir X" es por sección** (cada sección renderiza su propio pill `--level-1`).
  Como solo hay una sección montada a la vez, solo se ve el "+" del tab activo. En event el
  botón de añadir ya estaba **desacoplado** del diálogo (un `<button>` con `onClick` que
  abre un `AtomDialog` controlado aparte), así que el pill es un `<button
  class="floating-action__trigger">`, no un trigger de dialog.
- **Toggle** (flecha atrás) y **"Eliminar evento"** (`--level-2`, rojo) viven en el route.
- **Jueces → Ejercicios:** el tab de Ejercicios ya NO se deshabilita por falta de jueces
  (antes `disabled: !hasJudges()`); ahora el tab es accesible y el pill **"Añadir
  ejercicio" se deshabilita** con `disabled={props.eventJudges.length === 0}`.
- Configuración no tiene añadir (editor inline).

## Checklist para replicar en stage / event

- [ ] `arrow-back.svg` en el toggle (no ojo); lápiz ↔ flecha atrás.
- [ ] "Añadir <hijo>" → flotante encima del toggle (chip + círculo `+`), `AtomDialog`
      controlado + trigger de contenido plano + `triggerClass`.
- [ ] "Eliminar <entidad>" → flotante rojo encima de "Añadir", `trash.svg`,
      `ConfirmActionButton` con contenido plano.
- [ ] Los tres flotantes: `position: fixed`, `z-index: var(--z-floating)`, apilado con
      el mismo `calc(...)` de posición (compensando el `--unit-05` del FAB).
- [ ] Cards: acciones de fila a la izquierda. Tabla: se deja a la derecha (se acepta
      solape con el FAB), a ancho completo y con las mismas columnas en vista y edición.
- [ ] `resetScroll: false` ya está en `useSearchParam` (compartido, no hay que repetir).
- [ ] Claves i18n `ADD_...` nuevas en es/en.
- [ ] Revisar `padding-bottom` de página si el stack tapa el contenido final.

## Pendientes / dudas abiertas

- CSS ya extraído a `floating-actions.css` (hecho). Falta, si se quiere, un componente
  `FloatingActionStack` que encapsule también el markup del pill.
- Quedan clases muertas `.event-*-section__header` en las CSS de las secciones de event
  (el `<div>__header` que alojaba el "+" se eliminó). Limpiar cuando se pase por ahí.
- El botón "Editar" de fila en la card (vista lista) sigue siendo texto plano dentro de un
  trigger de dialog; valorar homogeneizar con los iconos de la tabla.
