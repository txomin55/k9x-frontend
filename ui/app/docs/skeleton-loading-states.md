# Skeleton loading states — patterns & lessons

Cómo añadir estados de carga con skeleton en pantallas que dependen de una API,
sin que la app "parezca muerta" con red lenta. Extraído del trabajo en **landing**
(`src/routes/index.tsx`) y **stages públicos** (`src/routes/stages/index.tsx`).

## Componente base: `AtomSkeleton`

`@lib/components/atoms/skeleton/AtomSkeleton`.

- Props: `variant` (`text` | `circular` | `rectangular`), `width`, `height`,
  `radius`, `count` (renderiza N), `animated`, `class`, `style`.
- Shimmer con tokens (`--surface-muted` / `--surface-hover`), dark-mode automático,
  `aria-hidden`, respeta `prefers-reduced-motion`.

**Regla de oro: cero layout shift.** El skeleton debe medir lo mismo que el
elemento real. La forma robusta es **reutilizar la misma caja** (mismas clases de
layout: borde/padding) con un skeleton fino dentro, en vez de fijar una altura a
ojo. En landing la fila skeleton reutiliza `.landing-page__latest-item-link` +
`<AtomSkeleton height="calc(var(--unit-2) + var(--unit-025))">` y mide
exactamente igual (44.2px) que la fila real.

## Cómo funciona Suspense + solid-query aquí (crítico)

Las queries se crean con `@tanstack/solid-query` (`createQuery`, envuelto en
`defineQuery(...).useQuery(...)`). Comportamiento clave (verificado en el source
5.91.1):

1. **Solo leer `.data` suspende.** El resultado es un `Proxy`: `.data` lee un
   `createResource` (suspende si está pending). `.isPending`, `.isLoading`,
   `.status`, etc. son `Reflect.get` normales → **no suspenden**.

2. **La suspensión se captura por el `<Suspense>` cuyo _owner_ contiene la lectura,
   no por anidamiento de JSX.** Si creas la query en el cuerpo del componente de
   ruta y la lees en un `<Suspense>` del mismo JSX, la suspensión se atribuye al
   owner del componente (el boundary del `<Outlet>`) y **se blanquea toda la ruta**
   (solo quedan navbar + breadcrumb, que viven en `AppLayout`, fuera del Outlet).

   → **Patrón que funciona (landing):** crear la query **dentro de un componente
   hijo** que viva bajo el `<Suspense>` local, y leer ahí. Así la lectura se captura
   localmente y el resto de la página pinta al instante.

   ```tsx
   <Suspense fallback={<Skeleton />}>
     <ChildThatCreatesAndReadsTheQuery />
   </Suspense>
   ```

3. **El resource es perezoso: la query NO hace fetch hasta que se lee `.data`.**
   Si gateas solo con `isPending` y nunca lees `.data`, la petición nunca se lanza
   → skeleton eterno. Si necesitas gatear sin suspender (p.ej. un mapa), añade un
   "primer" invisible que lea `.data` bajo un `<Suspense fallback={null}>` para
   disparar el fetch (ver `StagesDataPrimer`).

4. **Bucle infinito de refetch.** Varios observers de la misma query + montar/
   desmontar la vista + `refetchOnMount` → refetch en bucle. Ocurrió al meter el
   contenido dentro de `AtomSegmentedControl` (su `<For>`/`<Switch>` de contenido
   remonta al recomputar `controls()`). **Evítalo** desacoplando el contenido del
   control (ver stages) y no reconstruyendo el array `controls` en cada render
   (ver [[atom-segmented-control-remount]]).

## Dos estrategias según el caso

### A) Suspense local + componente hijo (para contenido que puede desaparecer bajo el skeleton)
Usado en **landing** (bloque "latest stages") y en list/table de **stages**.
- La vista crea su propia query y la lee bajo su propio `<Suspense>`.
- El fallback es el skeleton. Al resolver, muestra datos. Same-owner ⇒ resuelve
  bien (a diferencia de crear la query en el padre y leerla en el hijo, que puede
  quedarse colgado).

### B) Gating con `isPending` (para contenido que debe seguir visible mientras carga)
Usado en el **mapa** de stages: se pinta el mapa real (con `[]`) + un overlay
pequeño mientras `isPending()`, sin suspender (evita re-montar leaflet). Requiere
el primer del punto 3 para disparar el fetch si es el tab de entrada.

## Tab bar / breadcrumb visibles durante la carga

Para que la barra de tabs y el breadcrumb se vean mientras cada tab carga
(requisito en stages):
- El componente de ruta **no crea ninguna query** (crear no suspende, pero mejor
  mantenerlo limpio) → su chrome pinta al instante.
- `AtomSegmentedControl` se usa **solo como barra de tabs** (`content: null`).
- El contenido se renderiza en un `<Switch>` **propio y estable** debajo, donde
  cada tab es una vista que sigue la estrategia A o B.

## Layout

`.atom-segmented-control` es `height: 100%; display:flex; flex-direction:column`
(pensado para contener tabs + contenido). Si sacas el contenido fuera, el control
vacío se come toda la altura y empuja el contenido fuera de pantalla. Fix:

```css
.stages { display: flex; flex-direction: column; gap: var(--unit-1); }
.stages > .atom-segmented-control { height: auto; flex: none; }
.stages-map-wrapper { flex: 1; min-height: calc(var(--unit-10) * 4); }
```

**Tokens, no `rem` hardcodeado** (preferencia del proyecto): usa `--unit-*` /
`--radius-*`.

## `/refresh` (contexto)

Se dispara en cada carga aunque estés deslogueado (`recoverSessionFromRefresh` en
`stores/auth/auth.ts` intenta recuperar sesión por cookie). Es **concurrente**, no
bloquea el render (está en `AppShell.onMount`, async). El shell solo gatea por
`<Show when={i18n.ready()}>`. Si ves toda la app en blanco al cargar, mira i18n,
no `/refresh`.

## Cómo testear (evita perder el tiempo)

- **NO uses standalone** para esto: su mock (apidog) **devuelve 404 en `/stages`**
  → la query erra y parece un problema de suspense que no lo es.
- Usa **5173** (integrated, backend real en `:4000`).
- Para ver el skeleton, ralentiza **solo el endpoint concreto** (p.ej. `/stages`),
  **no** todo el host: si frenas las traducciones de i18n, el shell entero se
  bloquea tras `i18n.ready()` y confunde el diagnóstico.
- En Playwright: `serviceWorkers: "block"` + `page.route` que solo retrasa la URL
  del dato, e inyecta el token en `localStorage["k9x_access_token"]`.

## Pantallas pendientes (mismo criterio)

public/private stage detail, classification, my competitions/dogs/judges/
collections, collection detail, private event detail, y skeletons en breadcrumbs.
Aplicar A o B según si el contenido desaparece bajo el skeleton o debe permanecer.
