# Skeleton loading states — patterns & lessons

Cómo añadir estados de carga con skeleton en pantallas que dependen de una API,
sin que la app "parezca muerta" con red lenta. Extraído del trabajo en **landing**
(`src/routes/index.tsx`), **stages públicos** (`src/routes/stages/index.tsx`) y
**collection detail** (`src/components/routes/my/collections/$id/obdx/`).

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
   → skeleton eterno. Un `createMemo` que lea `.data` sirve de disparador porque corre
   eager al montar (por eso también suspende, ver más abajo). Antes se usaba un
   "primer" invisible (`StagesDataPrimer`) para disparar el fetch en el mapa; se
   retiró al pasar a un observer único compartido (ver secciones de tabs).

4. **Refetch por montaje (una petición por tab/vista).** `refetchOnMount` (o su
   default) + `staleTime` sin fijar (⇒ stale al instante) hace que **cada observer
   nuevo refetch-ee**. Si cada tab crea su propio observer, cada cambio de tab lanza
   una petición. Solución: **un solo observer compartido por contexto** para toda la
   pantalla (ver "Una sola petición para toda una pantalla con tabs"). Ojo aparte con
   remontar el contenido dentro de `AtomSegmentedControl` (su `<For>`/`<Switch>`
   remonta al recomputar `controls()`) → ver [[atom-segmented-control-remount]].

5. **El fallback lo dispara CUALQUIER resource bajo la `<Suspense>`, no solo tus
   queries.** `<Suspense>` muestra su fallback mientras haya *cualquier* resource en
   loading en su subárbol — incluido uno creado en un hijo al re-renderizar. El
   fallback mostrado es siempre el mismo skeleton, así que su forma NO indica quién
   suspendió. Ver la sección "Skeleton que reaparece al mutar".

## Un "blink de recarga de toda la página" NO es Suspense (crítico)

Síntoma: la landing pinta bien (hero + skeleton, o incluso ya con datos) y **de
golpe parpadea toda la página como si recargara**. Es fácil perder el tiempo mirando
Suspense/skeleton — **no es eso**. Verificado muestreando el DOM por `requestAnimationFrame`:
el árbol nunca se queda en blanco; el único cambio es el swap skeleton→datos. Un blink
de página entera **siempre es un `location.reload()`** (o una navegación). Regla:
si ves un blink, busca quién recarga, no toques el Suspense.

Dos fuentes de reload que causaban esto (ambas ya eliminadas/entendidas):

1. **Service worker (afecta a producción).** El SW hace `skipWaiting()` en `install`
   + `clients.claim()` en `activate`
   (`src/utils/service-worker/events/setup.ts`). Al reclamar la página se dispara
   `controllerchange`, y `AppShell` llamaba `globalThis.location.reload()` en ese
   evento → recarga completa. Salta en la **primera visita** (primer claim de una
   página sin controlador) y en **cada update del SW**. **Se quitó el auto-reload por
   completo**: el SW nuevo toma control en silencio y los assets frescos se sirven en
   la siguiente navegación (patrón estándar). NO reintroducir el
   `controllerchange → location.reload()`: es exactamente lo que parpadea. Si algún
   día hace falta avisar de una versión nueva, usar un toast "recargar", nunca un
   reload automático.

2. **Vite HMR (solo dev).** Un trace de DevTools del blink mostró el reload disparado
   por `@vite/client` (full-reload de HMR / reconexión del socket), pasando por un
   `beforeunload` de `@tanstack/history`. `// @refresh reload` en `entry-client.tsx`
   hace que Solid recargue entero en updates de HMR. Es el servidor de desarrollo, no
   la app, y **no ocurre en preview/producción**. No perseguirlo desde el código de la
   app.

Cómo diagnosticar un blink (rápido, sin token): abrir en contexto limpio / incógnito,
trapear `location.reload` (`Object.defineProperty(location,"reload",...)`) para ver el
stack, y contar navegaciones de documento (cada full-reload crea un `performance.timeOrigin`
nuevo). En un trace: `browser_initiated:true` + `BeforeUnloadDialog` = recarga
manual/HMR; una llamada JS a `location.reload()` sale como renderer-initiated.

## Skeleton que reaparece al mutar (no solo en carga) — crítico

Síntoma (fue en **collection detail**, al editar cada puntuación): la pantalla ya
tiene datos y, **al mutar**, parpadea el skeleton entero de la ruta. El requisito es
que el skeleton salga **solo en la carga inicial**, nunca al mutar.

Diagnóstico (verificado): NO era la query de datos. El componente **no se re-montaba**
(un `console.log` en el body corría una sola vez) y el `status`/`isFetching` de las
queries **no cambiaba** (`success`/`false`); no había refetch en red (solo el PUT
optimista). Y aun así aparecía el skeleton de ruta completo. Causa: **un resource de un
componente HIJO re-creado durante la mutación**. `CountryFlag` usaba `createResource`
(import dinámico del SVG); en el detalle, el `<AtomSelect>` de competidores pinta un
`CountryFlag` por opción vía `ScoresCompetitorPreLabel`. Al puntuar, `collectionData.data`
cambia (setQueryData optimista) y `seenCompetitors` se recomputa → el memo de opciones
se reconstruye con **nuevos** `CountryFlag` → cada `createResource` nuevo entra en
loading un frame → como cuelga de la `<Suspense>` de la ruta, parpadea el skeleton
entero (ver punto 5 de la sección de Suspense).

Reglas que salen de aquí:

- **No pongas `createResource` en componentes hoja reutilizables** (iconos, banderas,
  avatares) que se re-crean con cada cambio de lista/datos: cualquier re-creación los
  mete en loading y hacen parpadear el `<Suspense>` del padre. Resuélvelos con
  `createSignal` + **caché a nivel de módulo** de lo ya resuelto, mostrando un fallback
  propio (texto/placeholder) mientras cargan la 1ª vez. Así **no suspenden** y, ya
  cacheados, se pintan síncronos. (Es lo que se hizo en `CountryFlag`: se mantiene el
  glob `eager:false` → sigue siendo lazy por país; solo dejó de suspender.)
- Si un skeleton reaparece al mutar, **no mires la query de datos primero**: busca qué
  resource hijo se re-crea (banderas/iconos/lazy) bajo esa `<Suspense>`.
- Las mutaciones deben ser **optimistas con `setQueryData`** (nunca dejar `.data` en
  `undefined`) para no re-suspender por la propia data.

## Una sola petición para toda una pantalla con tabs (SOT compartida) — crítico

Síntoma que hubo en **stages**: **cada cambio de tab lanzaba un GET a `/stages`**
(medido: carga + 9 cambios de tab = 7 peticiones). Causa: cada vista de tab
(`StagesListView`, `StagesTableView`, `StagesMapView`) llamaba a `useSortedStages()`,
que **creaba su propio observer** con `useStages({ refetchOnMount: !isOffline() })`.
Al no fijar `staleTime`, los datos quedan *stale* al instante, así que **cada montaje
de observer (cada tab) refetch-ea**. (El mapa además creaba un `StagesDataPrimer`
extra y `EnrollDialog` otro.)

**Patrón correcto: un único observer a nivel de pantalla, compartido por contexto.**

```tsx
const StagesDataContext = createContext<ReturnType<typeof useStages>>();

function StagesDataProvider(props: ParentProps) {
  const { isOffline } = useOffline();
  const query = useStages({ refetchOnMount: !isOffline(), gcTime: 5 * 60 * 1000 });
  return <StagesDataContext.Provider value={query}>{props.children}</StagesDataContext.Provider>;
}
const useStagesQuery = () => { const q = useContext(StagesDataContext); if (!q) throw …; return q; };
```

- El **provider** crea el observer **una vez** (crear NO lee `.data` ⇒ NO suspende ⇒
  no blanquea la ruta). Se pone envolviendo el contenido de la página.
- Cada vista (`useSortedStages`, primer, dialog) hace `useStagesQuery()` y **lee** de
  ese observer compartido, en vez de crear el suyo.
- Como el observer vive en la página y **no se remonta al cambiar de tab**, no hay
  refetch por tab: 1 petición por visita, y todos los tabs comparten el mismo dato.
- **La lectura sigue en el hijo** (bajo su `<Suspense>` local), así se respeta la
  atribución de owner del punto 2 (skeleton local, no blanqueo de ruta).
- No hace falta `StagesDataPrimer`: la primera vista que lee `.data` dispara el fetch.

## Cada tab necesita su PROPIO `<Suspense>` (incluido el mapa) — crítico

`useSortedStages()` crea `createMemo(() => { const s = fetchedStages.data ?? []; … })`.
`createMemo` corre **eager** al montar la vista, así que **lee `.data` al instante y
suspende** — no basta con gatearlo en el JSX (`isPending() ? [] : sortedStages()`),
porque el memo ya leyó al crearse. Por eso **cada `<Match>` de tab debe ir envuelto en
su propio `<Suspense fallback={skeleton}>`**. Si a un tab le falta (le pasó al mapa),
la suspensión sube hasta el boundary de la ruta y **blanquea toda la pantalla,
incluidos los controles**, hasta que resuelve la query. List/Table iban bien porque ya
tenían su Suspense; el mapa no, y por eso al recargar en `view=MAP` no se pintaban los
controles.

Con el observer único compartido, el **mapa ya no necesita el truco de `isPending` +
primer** (el viejo enfoque de "gating sin suspender", ahora retirado): usa la misma
estrategia base que list/table (Suspense local + skeleton) —
`<Suspense fallback={<StagesMapSkeleton />}>` + leer `sortedStages()` directamente.
Solo suspende en la primera carga (no hay refetch por tab ni por filtro cliente), así
que leaflet no se remonta por datos.

## Estrategia base: Suspense local + lectura en el hijo

Usado en **landing** (bloque "latest stages") y en list/table/mapa de **stages**.
- La query se crea en el hijo, **o** en un provider de pantalla (ver sección de SOT
  compartida); lo que importa es que la **lectura** de `.data` ocurra en el hijo que
  vive bajo su `<Suspense>`. Same-owner-para-la-lectura ⇒ resuelve bien (a diferencia
  de leerla en el padre/owner del Outlet, que blanquea la ruta).
- El fallback es el skeleton. Al resolver, muestra datos.

## Tab bar / breadcrumb visibles durante la carga

Para que la barra de tabs y el breadcrumb se vean mientras cada tab carga
(requisito en stages):
- El componente de ruta **no lee** ninguna query (crear el observer en un provider no
  suspende; solo leer `.data` suspende) → su chrome pinta al instante.
- `AtomSegmentedControl` se usa **solo como barra de tabs** (`content: null`).
- El contenido se renderiza en un `<Switch>` **propio y estable** debajo, donde
  cada tab es una vista con su **propio `<Suspense>`** (ver secciones anteriores).

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
`<Show when={i18n.ready()}>`. Si ves toda la app **en blanco fijo** al cargar, mira
i18n, no `/refresh`. Si es un **blink/parpadeo** (aparece y desaparece), es un reload:
ver la sección "Un blink de recarga… NO es Suspense".

Ojo con el token de pruebas: un `.k9x-token` caducado provoca un **bucle de
redirecciones de auth** (varias cargas de documento seguidas) que parece un
reload-loop pero no lo es. Para diagnosticar un blink, prueba la landing pública
**sin token**.

## Cómo testear (evita perder el tiempo)

- **NO uses standalone** para esto: su mock (apidog) **devuelve 404 en `/stages`**
  → la query erra y parece un problema de suspense que no lo es.
- Usa **5173** (integrated, backend real en `:4000`).
- Para ver el skeleton, ralentiza **solo el endpoint concreto** (p.ej. `/stages`),
  **no** todo el host: si frenas las traducciones de i18n, el shell entero se
  bloquea tras `i18n.ready()` y confunde el diagnóstico.
- En Playwright: `serviceWorkers: "block"` + `page.route` que solo retrasa la URL
  del dato, e inyecta el token en `localStorage["k9x_access_token"]`.

## Empty-state que parpadea antes de cargar el user (crítico)

Síntoma (fue en **my/competitions/list** y **my/judges/list**): al entrar/F5, la lista
enseña un instante el label de vacío ("No competitions created" / "No judges available yet")
y luego aparecen las cards. Con red rápida es un flash; con user lento se ve claramente.

Causa (verificada con traza + repro retrasando `/secured/user`): **no es Suspense**, es una
**race destapada por el render optimista de `/my`**. `routes/my/route.tsx` renderiza el
`<Outlet>` en cuanto hay token, **antes** de que `user()` resuelva. La ruta hoja monta y su
query dispara el fetch mientras `user()` es aún `null`. Los CRUD de organizer resuelven
**vacío en local, sin ir a red** cuando aún no saben que eres organizer:

```ts
// competitionCrud / judgeCrud
export const refreshCompetitionsSnapshot = async () => {
  if (!isOrganizer()) {                                    // user aún sin cargar ⇒ false
    return queryClient.getQueryData(getCompetitionsQueryKey()) ?? [];  // ⇒ []  (¡sin fetch!)
  }
  const competitions = await rawRequest({ path: "/secured/competitions" });
  ...
```

La query queda `success` con `data=[]` ⇒ sale el label. Luego `user()` resuelve, el
`createEffect` de `AppShell` re-hace prefetch ya como organizer y llegan los datos reales.
En la traza se ve clarísimo: **no hay petición temprana** a `/secured/competitions` (el `[]`
se sirve en local) y la de verdad no sale hasta después de `/secured/user`.

**Fix: gatear la query hasta conocer al user** (mismo patrón que evita fetchear owned dogs
deslogueado). Se enhebra un `enabled` **reactivo** vía `TanstackCreateQuery.enabled: () => boolean`,
que el wrapper reenvía con un **getter** para que se re-evalúe dentro del thunk reactivo de
`createQuery` (un valor plano se captura una vez y no reacciona al login):

```ts
// createXQuery(...)
.useQuery({
  staleTime, gcTime, networkMode: "always", refetchOnMount,
  get enabled() { return options?.enabled ? options.enabled() : true; },
})

// en la ruta
const user = useAuthUser();
const q = useCompetitions({ ..., enabled: () => Boolean(user()) });
```

Disabled + sin datos ⇒ `isPending` true, `isFetching` false ⇒ skeleton (no label) hasta que
`user()` llega y arranca el fetch real. Afecta a los CRUD con el short-circuit `!isOrganizer() → []`
(**competitions**, **judges**). `allDogs` **no** lo tiene (`refreshAllDogsSnapshot` siempre
hace fetch real) ⇒ no parpadea; ahí el `enabled` es solo defensivo. Ver [[optimistic-render-organizer-empty-flash]].

## El label de vacío debe exigir estado RESUELTO, no solo `!isFetching` (crítico)

El proxy de datos colapsa `undefined` (cargando) y `[]` (vacío real) al mismo `[]` (el merge
hace `baseData ?? []`), así que `data?.length` **no distingue** "cargando" de "vacío". Gatear
el label solo con `!isFetching` **no basta**: en el primer tick la query está `pending` con
`fetchStatus: 'idle'` (aún no arrancó el fetch) ⇒ `isFetching` es `false` y `data` es `[]`
⇒ parpadea el label un frame. Hay que contar también `isPending`:

```tsx
<Show
  when={q.data?.length || (!q.isPending && !q.isFetching)}   // contenido/label solo si RESUELTO
  fallback={<CardListSkeleton count={4} />}                  // si no, skeleton
>
  <Show when={q.data?.length} fallback={<span>{t("...NO_X")}</span>}>
    ...cards
  </Show>
</Show>
```

Leer `.isPending`/`.isFetching` **no suspende** (solo `.data`), así que el guard es seguro.
Resultado: skeleton en carga (inicial y refetch-sin-datos), cards si hay refetch con datos
(sin flicker), y el label **solo** cuando el endpoint devuelve `[]` ya resuelto. Verificado en
navegador con `page.route` (retrasar `/secured/user` para la race; `fulfill([])` para el vacío real).

## Páginas de detalle: "X not found" mientras carga (crítico)

Síntoma (fue en **competition detail** `/my/competitions/$id` y **stage detail**
`/my/competitions/$id/stages/$stageId`, entrando directo / F5): sale "Competition not found" /
"Trial not found" un instante y luego aparece el detalle.

Causa: es la **misma race organizer** de la sección anterior, pero en páginas de entidad única.
El detalle no tiene su propia query: deriva la entidad de la **lista de competiciones**
(`getCompetition(id)` → `createCompetitionsQuery`; `getStage` → `getCompetition`). Si esa query
resuelve `[]` antes de cargar el user (organizer aún desconocido), `find(id)` da `undefined` y
el `<Show when={entity()} fallback={<p>NOT_FOUND</p>}>` enseña el "not found".

**Agravante `staleTime: Infinity`:** `getCompetition` usa `staleTime` infinito (no auto-refetch,
confía en el prefetch de la lista). Si el `[]` de la race entra en caché, se queda **pegado**
(fresco para siempre) y ni un observer nuevo lo refresca; solo lo sobrescribe el
`prefetchCompetitions` del `AppShell` (que corre con `staleTime: 0`) cuando el user ya es organizer.

**Fix (dos partes):**
1. **Gatear la query derivada en `user()`** para que el `[]` **nunca** se escriba en caché
   (`enabled: () => Boolean(user())` en la `createCompetitionsQuery` interna de `getCompetition`).
   Con la query deshabilitada no hay `[]`; al llegar el user, fetch limpio ⇒ datos reales.
2. **Guardar el fallback "not found" con estado resuelto**, porque una query deshabilitada/cargando
   devuelve `undefined` **sin suspender** ⇒ el `<Show>` caería al "not found". Se envuelve con un
   check de resuelto (otro observer barato de `useCompetitions` gateado, comparte caché):

   ```tsx
   const user = useAuthUser();
   const q = useCompetitions({ staleTime: Number.POSITIVE_INFINITY, enabled: () => Boolean(user()) });
   const isResolved = () => !q.isPending && !q.isFetching;
   const entity = createMemo(() => (q.data ?? []).find((e) => e.id === props.id));
   // ...
   <Suspense fallback={<DetailSkeleton />}>
     <Show when={entity() || isResolved()} fallback={<DetailSkeleton />}>   {/* cargando ⇒ skeleton */}
       <Show when={entity()} fallback={<p>{t("...NOT_FOUND")}</p>}>          {/* resuelto sin id ⇒ not found */}
         <DetailBody entity={entity} />
       </Show>
     </Show>
   </Suspense>
   ```

   El "not found" solo sale con la lista **resuelta** y el id ausente de verdad. Verificado con
   `page.route` retrasando `/secured/user`: `sawNotFound=false, sawSkeleton=true`.

## Pantallas pendientes (mismo criterio)

public/private stage detail, classification, my competitions/dogs/judges/
collections, collection detail, private event detail, y skeletons en breadcrumbs.
Aplicar A o B según si el contenido desaparece bajo el skeleton o debe permanecer.
