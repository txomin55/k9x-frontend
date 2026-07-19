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

Stack flotante, de abajo hacia arriba:

```
              [ Eliminar <entidad> ]  (○🗑)   ← rojo, solo si es borrable
              [ Añadir <hijo>      ]  (○+)    ← solo en modo edición
                                      (○↩)    ← toggle: lápiz (ver→editar) / flecha atrás (editar→ver)
```

---

## Decisiones

### 1. Toggle ver/editar (FAB base)

- Componente reutilizable `components/common/floating-toggle-circle/FloatingToggleCircle`.
- Icono en modo vista: **lápiz** (`pencil.svg`). Icono en modo edición: **flecha atrás
  curva** (`arrow-back.svg`) — NO un ojo.
- Se muestra con `<Show when={canEditCompetition(status)}>` (equivalente: `canEdit<Entidad>`).

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
- **Vista tabla:** la columna de acciones va a la derecha por convención. Para librar el
  stack en **modo edición** se mete `padding-right` ≈ ancho del FAB **al contenedor de la
  tabla** (NO a la celda de acciones):

  ```css
  .stages-section__table--editing {
    padding-right: calc(var(--circle-size-md) + var(--unit-2));
  }
  ```
  Aplicado con `classList={{ "...__table--editing": props.isEditing }}` en el wrapper del
  `AtomTable`.

  > ⚠️ NO poner el `padding-right` en la celda/`.list-table__actions`: ensancha la columna,
  > la tabla desborda (`.atom-table__scroller { overflow:auto }`) y la columna de acciones
  > se va **fuera del viewport** (parece que "faltan" los botones). Encogiendo el contenedor
  > toda la tabla se desplaza a la izquierda sin crear scroll. `.list-table__actions` es
  > compartida por otras tablas, así que tampoco se toca globalmente.

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

## Checklist para replicar en stage / event

- [ ] `arrow-back.svg` en el toggle (no ojo); lápiz ↔ flecha atrás.
- [ ] "Añadir <hijo>" → flotante encima del toggle (chip + círculo `+`), `AtomDialog`
      controlado + trigger de contenido plano + `triggerClass`.
- [ ] "Eliminar <entidad>" → flotante rojo encima de "Añadir", `trash.svg`,
      `ConfirmActionButton` con contenido plano.
- [ ] Los tres flotantes: `position: fixed`, `z-index: var(--z-floating)`, apilado con
      el mismo `calc(...)` de posición (compensando el `--unit-05` del FAB).
- [ ] Acciones de fila fuera de la esquina inferior derecha (cards a la izquierda;
      tabla con `padding-right` solo en edición).
- [ ] `resetScroll: false` ya está en `useSearchParam` (compartido, no hay que repetir).
- [ ] Claves i18n `ADD_...` nuevas en es/en.
- [ ] Revisar `padding-bottom` de página si el stack tapa el contenido final.

## Pendientes / dudas abiertas

- Unificar el patrón en un componente/CSS reutilizable (`FloatingActionStack`) en vez de
  repetir estilos por página. Hoy está inline en la styles.css de competición.
- El botón "Editar" de fila en la card (vista lista) sigue siendo texto plano dentro de un
  trigger de dialog; valorar homogeneizar con los iconos de la tabla.
