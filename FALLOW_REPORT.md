# Reporte fallow — plan de remediación

Generado con `npx fallow` / `npx fallow --format json` (fallow 3.2.0) el 2026-07-06.

Resumen: `MI 91.4 (good)` · 466 archivos analizados · 0% dead code real · 4 dependencias circulares · 3.9% de código duplicado (1089 líneas / 29 archivos) · 69 funciones por encima del umbral de complejidad · 11 refactoring targets priorizados.

Comando para reproducir: `npx fallow` (texto) / `npx fallow --format json` (detalle completo).

> **Nota sobre "27 dead-code issues"**: el CLI etiqueta esta sección como "Dead Code" pero no hay ni un solo archivo o export muerto (`unused_files`, `unused_exports`, `unused_types` = 0 de 731 exports / 466 archivos). El "27" es la suma de higiene de dependencias e imports: 2 dependencias no usadas + 15 dev-dependencies no usadas + 5 imports no resueltos + 1 dependencia no listada + 4 ciclos de import. Tratar como "Dependency & Import Hygiene", no como código muerto real.

---

## 0. Quick wins (5 min, bajo riesgo) — ✅ completado 2026-07-07

- [x] **`jsdom`** (`configuration/my-vitest/package.json`) — era falso positivo: se resuelve por string vía `environment: "jsdom"` en `vitest.config.ts`, no por import estático. Se mantiene y se añadió a `ignoreDependencies` en `.fallowrc.json`.
- [x] **Eliminada dependencia no usada** `js-yaml` de `ui/app/package.json`.
- [x] **Dependencia no listada** `my-eslint` — añadida a `devDependencies` de `coverage_processor/package.json` (`workspace:^`).
- [x] **Imports no resueltos** — añadido `**/.reports/test/unit/coverage/coverage-final.json` a `ignoreUnresolvedImports` en `.fallowrc.json`, cubriendo `unit_coverage_processor.ts:8` y `:17`. Los dos de `total_coverage_processor.ts` (líneas 18 y 27, mismo patrón pero de `.reports/test/e2e/...` y `.reports/test/unit/...`) se dejan **sin tocar a propósito** — pendiente para otra sesión.
- [x] **Import roto real corregido** en `ui/app/src/routes/my/collections/$id/route.test.tsx:40` — faltaba el segmento `obdx`; ahora coincide con el import real usado en `ObdxCollectionDetail.tsx`.
- [x] **15 dev-dependencies no usadas** — revisadas una a una (grep de uso real + configs de storybook/playwright/vite):
  - Confirmadas como falsos positivos (uso vía string, no import estático) y añadidas a `ignoreDependencies`: `@bdellegrazie/playwright-sonar-reporter` (reporter de playwright.config.ts), `@chromatic-com/storybook`, `@storybook/html-vite`, `storybook-addon-tag-badges` (resueltos por `getAbsolutePath()` en `.storybook/main.ts`).
  - Eliminadas por no tener ningún uso real: `ui/app`: `vite-plugin-pwa`, `vite-plugin-static-copy`, `@stoplight/prism-cli` (confirmado con el usuario que no se usa como CLI manual). `ui/library`: `@mdx-js/react`, `@storybook/addon-designs`, `@storybook/addon-links`, `autoprefixer`, `globals`, `import`, `prop-types`.
  - `vite-jsconfig-paths` — eliminada de `ui/library/package.json` (ya estaba presente en `ui/app/package.json`, no había nada que mover).
- Verificación: `npx fallow dead-code` ya no reporta ningún hallazgo de dependencias/imports salvo el de `total_coverage_processor.ts` dejado a propósito y los 4 ciclos de la sección 1 (pendientes). `pnpm install` limpio. El test `route.test.tsx` sigue fallando por un problema preexistente de entorno (`Unknown file extension ".jsx"` al resolver `@kobalte/core`), no relacionado con estos cambios — reproducido también en `main` antes de tocar nada.

---

## 1. Dependencias circulares (4)

Todas requieren extraer lógica compartida a un módulo neutral para romper el ciclo (`refactor-cycle`).

1. `competitionCrud.ts` ↔ `competitionCrudOfflineUtils.ts`
   - `ui/app/src/services/secured/competition-crud/competitionCrud.ts:8` → `ui/app/src/services/secured/competition-crud/competitionCrudOfflineUtils.ts:2`
2. `competitionCrud.ts` → `stores/auth/auth.ts` → `localFirstQueryCache.ts` → (vuelta a competitionCrud)
   - `ui/app/src/services/secured/competition-crud/competitionCrud.ts:23`
   - `ui/app/src/stores/auth/auth.ts:9`
   - `ui/app/src/utils/local-first/query_snapshots/localFirstQueryCache.ts:1`
3. `competitionCrud.types.ts` ↔ `stageCrud.types.ts`
   - `ui/app/src/services/secured/competition-crud/competitionCrud.types.ts:1`
   - `ui/app/src/services/secured/stage-crud/stageCrud.types.ts:1`
4. `competitionCrud.types.ts` → `stageCrud.types.ts` → `eventCrud.types.ts` → (vuelta)
   - `ui/app/src/services/secured/competition-crud/competitionCrud.types.ts:1`
   - `ui/app/src/services/secured/stage-crud/stageCrud.types.ts:2`
   - `ui/app/src/services/secured/event-crud/eventCrud.types.ts:5`

Los ciclos 3 y 4 sugieren que los `.types.ts` de competition/stage/event deberían compartir tipos base en un módulo común (p.ej. `crudShared.types.ts`) en lugar de importarse entre sí.

---

## 2. Refactoring targets priorizados (de mayor a menor prioridad)

| pri | archivo | motivo | esfuerzo |
|---|---|---|---|
| 35.9 | `ui/app/src/services/secured/competition-crud/competitionCrud.ts` | ciclo de importación, 14 dependientes | alto |
| 35.3 | `ui/app/src/services/secured/event-crud/eventCrud.ts` | 603 LOC, alto impacto, 3 dependientes | alto |
| 30.9 | `ui/app/src/utils/local-first/localFirstPolicy.ts` | 18 dependientes amplifican cada cambio | alto |
| 30.8 | `ui/app/src/services/fetch-stages/fetchStages.ts` | 135 LOC, 8 dependientes | medio |
| 30.2 | `ui/app/src/stores/auth/auth.ts` | ciclo de importación, 21 dependientes | alto |
| 25.7 | `ui/library/src/components/atoms/svg-icon/AtomSvgIcon.tsx` | 15 dependientes amplifican cada cambio | alto |
| 22.8 | `ui/app/src/services/secured/dog-crud/dogCrudOfflineUtils.ts` | 2 funciones complejas sin cobertura de test | medio |
| 21.6 | `ui/app/src/services/secured/event-crud/eventCrud.types.ts` | ciclo de importación, 21 dependientes | alto |
| 16.3 | `ui/app/src/services/secured/competition-crud/competitionCrudOfflineUtils.ts` | ciclo + clon `dup:5bfa4f07` compartido con otros 4 archivos | medio |
| 14.7 | `ui/app/src/services/secured/competition-crud/competitionDraftStore.ts` | 102 LOC, 4 dependientes | medio |

Empezar por `fetchStages.ts` (más alto ROI a menor esfuerzo) según recomendación directa de fallow, y dejar los de `effort:high` (ciclos de auth/competition/event) para una sesión dedicada dado que tocan módulos centrales muy usados.

---

## 3. Complejidad — funciones por encima del umbral (69 total: 17 críticas, 12 altas, 40 moderadas)

Umbrales: cyclomatic ≤ 20, cognitive ≤ 15, tamaño de función ≤ 60 líneas, CRAP ≤ 30.

### Críticas (17) — priorizar estas primero, ordenadas por CRAP score

| archivo | función | línea | cyclo | cog | líneas | CRAP |
|---|---|---|---|---|---|---|
| `ui/app/src/services/secured/dog-crud/dogCrudOfflineUtils.ts` | `toDogListItem` | 24 | 28 | 12 | 16 | 812.0 |
| `ui/app/src/services/secured/event-crud/eventCrud.ts` | `mergeApiEventWithPayload` | 185 | 50 | 18 | 100 | 590.0 |
| `ui/app/src/services/secured/stage-crud/stageCrud.ts` | `mergeApiStageWithPayload` | 27 | 20 | 8 | 18 | 420.0 |
| `ui/app/src/services/secured/event-crud/eventCrud.ts` | `toApiCompetitor` | 162 | 32 | 14 | 22 | 253.2 |
| `.../obdx/competitor/CompetitorEditorForm.tsx` | `<arrow>` | 108 | 15 | 6 | 89 | 240.0 |
| `ui/app/src/routes/my/competitions/$id/index.tsx` | `CompetitionDetailBody` | 97 | 15 | 9 | 267 | 240.0 |
| `ui/app/playwright/api-mocks/eventDetail.ts` | `competitors` | 157 | 31 | 9 | 24 | 238.6 |
| `.../obdx/competitor/CompetitorEditorForm.tsx` | `<arrow>` | 82 | 14 | 7 | 12 | 210.0 |
| `.../obdx/competitor/EventCompetitorsSection.tsx` | `getCompetitorDetails` | 75 | 14 | 6 | 13 | 210.0 |
| `ui/app/src/services/secured/competition-crud/competitionCrud.ts` | `mergeCompetitionWithPayload` | 101 | 25 | 12 | 27 | 160.0 |
| `ui/app/src/routes/stages/index.tsx` | `<arrow>` | 156 | 12 | 11 | 11 | 156.0 |
| `ui/app/src/routes/my/competitions/$id/index.tsx` | `commitCompetitionEdits` | 281 | 12 | 9 | 27 | 156.0 |
| `ui/library/.storybook/withDarkTheme.decorator.ts` | `getThemeFromManagerDom` | 61 | 11 | 9 | 36 | 132.0 |
| `ui/app/src/services/secured/dog-crud/dogDraftStore.ts` | `replaceDogDrafts` | 59 | 10 | 11 | 26 | 110.0 |
| `ui/app/src/services/secured/judge-crud/judgeCrud.ts` | `mergeJudgeWithPayload` | 82 | 10 | 3 | 8 | 110.0 |
| `ui/app/src/components/routes/my/judges/list/judge-form/JudgeForm.tsx` | `JudgeForm` | 25 | 10 | 10 | 62 | 110.0 |
| `ui/app/src/services/secured/judge-crud/judgeDraftStore.ts` | `replaceJudgeDrafts` | 46 | 10 | 11 | 28 | 110.0 |

Patrón claro: las funciones `mergeApi*WithPayload` / `toApi*` de los CRUD (`eventCrud.ts`, `stageCrud.ts`, `competitionCrud.ts`, `judgeCrud.ts`) y las de `*Draft Store.ts` concentran la mayor complejidad — candidatas a extraer sub-funciones por campo/sección.

### Altas (12)

- `ui/app/src/components/routes/my/collections/$id/obdx/ObdxCollectionDetail.tsx:74` `ObdxCollectionDetail` — cyclo 17, cog 17, 352 líneas, CRAP 79.4
- `ui/app/smoke/auth.setup.ts:16` `readCredentials` — CRAP 72.0
- `.../obdx/configuration/ConfigurationEditorForm.tsx:120` `<arrow>` — CRAP 72.0
- `ui/app/src/utils/http/client.ts:64` `extractErrorMessage` — CRAP 56.3
- `ui/app/src/routes/stages/index.tsx:176` `renderStageCard` — CRAP 56.0
- `ui/app/src/routes/stages/$id/info.tsx:262` `<arrow>` — CRAP 56.0
- `ui/app/smoke/auth.setup.ts:135` `<arrow>` — CRAP 56.0
- `ui/app/src/components/routes/my/competitions/$id/competition-info/CompetitionInfo.tsx:32` `CompetitionInfo` — CRAP 56.0
- `ui/app/src/utils/service-worker/events/runtime-cache.ts:37` `networkFirst` — CRAP 56.0
- `ui/library/.storybook/withDarkTheme.decorator.ts:41` `getThemeFromBackgroundGlobals` — CRAP 56.0
- `ui/app/src/services/secured/judge-crud/judgeCrudOfflineUtils.ts:28` `toJudgeListItem` — CRAP 56.0
- `.../stages-section/StageEditorForm.tsx:80` `<arrow>` — CRAP 56.0

### Moderadas (40)

Volumen alto, menor urgencia; abordar de forma oportunista al tocar cada archivo. Lista completa disponible vía `npx fallow --format json | jq '.health.findings'` (guardada también en `/tmp/.../fallow_report.json` de esta sesión). Concentraciones notables:
- `ui/app/src/routes/my/competitions/$id/index.tsx` (varias funciones)
- `ui/app/src/routes/my/competitions/$id/stages/$stageId/events/$eventId/index.tsx` (archivo de 912 líneas — candidato a split independientemente de las funciones individuales)
- `ui/app/src/routes/stages/index.tsx` / `ui/app/src/routes/stages/$id/info.tsx` (duplican bastante lógica entre sí, ver duplicados abajo)
- `ui/library/.storybook/withDarkTheme.decorator.ts` (3 funciones moderadas/altas — este decorator de Storybook concentra mucha complejidad, candidato a refactor propio)

---

## 4. Duplicación de código (26 grupos, 1089 líneas, 3.9%)

Agrupados por tipo de fix sugerido:

### A. Extraer helper compartido (alta confianza, bajo riesgo)

- **`RedCardDialog.tsx` / `YellowCardDialog.tsx`** (mismo patrón "card" con distinto color) — 2 clones:
  - `ui/app/src/components/routes/my/collections/$id/obdx/red-card/RedCardDialog.tsx:28-86` ↔ `yellow-card/YellowCardDialog.tsx:29-94` (66 líneas)
  - `RedCardDialog.tsx:96-111` ↔ `YellowCardDialog.tsx:112-127` (16 líneas)
  - Sugerencia: extraer un `CardDialog` base parametrizado por color/severidad.
- **`CompetitorEditorForm.tsx` / `ExerciseEditorForm.tsx`** — `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/competitor/CompetitorEditorForm.tsx:39-49` ↔ `exercises/ExerciseEditorForm.tsx:36-46` (11 líneas)
- **`StageEditorForm.tsx` / `JudgeForm.tsx`** — `ui/app/src/components/routes/my/competitions/$id/stages-section/StageEditorForm.tsx:34-45` ↔ `ui/app/src/components/routes/my/judges/list/judge-form/JudgeForm.tsx:39-47` (12 líneas) — probablemente boilerplate de formulario repetido en todos los `*Form.tsx`, vale la pena revisar si hay un patrón común extraíble a un hook.
- **`stages/$id/info.tsx` / `stages/index.tsx`** — comparten mucha lógica (mismo componente renderizado en dos vistas distintas de "stage"):
  - líneas 55-68 ↔ 66-79 (14 líneas)
  - líneas 72-93 ↔ 90-111 (22 líneas)
  - **líneas 275-341 ↔ 335-397 (67 líneas — el clon más grande de código de producto)**
  - Sugerencia: extraer un componente/hook compartido `StageDetailContent` o similar; esto también reduciría el hallazgo de complejidad de `StagesIndexPage`.
- **`StageCardEventsContent.tsx`** duplicado con dos vecinos distintos — candidato a extraer una función `renderEventBadge`/similar:
  - `ui/app/src/components/routes/stages/stage-card/StageCardEventsContent.tsx:57-73` ↔ `ui/app/src/routes/stages/$id/info.tsx:166-182`
  - `StageCardEventsContent.tsx:57-70` ↔ `ui/app/src/components/routes/stages/stages-map/StageMapMarker.tsx:85-99`
- **`eventCrudOfflineUtils.ts` / `stageCrudOfflineUtils.ts`** — 36 líneas duplicadas (164-199 / 140-173) — mismo patrón offline entre entidades CRUD, buen candidato a factorizar en un helper genérico de "offline utils" parametrizado por tipo de entidad.
- [x] **Clon compartido por 5 archivos `*CrudOfflineUtils.ts`** (`dup:5bfa4f07`, 13 líneas) — ✅ resuelto 2026-07-07: extraído `createCommitEntityMutation` en `ui/app/src/services/secured/crudOfflineShared.ts` (factory que envuelve `commitOptimisticMutation` fijando `entityType` y `rollback`). Los 5 `commit*Mutation` (`collection`, `competition`, `event`, `judge`, `stage`) quedan en una línea cada uno: `createCommitEntityMutation<XRollbackPayload>("x", rollbackXPayload)`. Verificado con `npx fallow dupes` (el clon ya no aparece), `tsc --noEmit` limpio y `vitest run` (27/27 tests; los 2 fallos de archivos con Kobalte son el problema preexistente sin relación).
- **`dogCrud.ts`** duplicado consigo mismo — `ui/app/src/services/secured/dog-crud/dogCrud.ts:79-91` ↔ `:121-135` (15 líneas)
- **`useSearchParam.ts`** duplicado consigo mismo — `ui/app/src/utils/search-params/useSearchParam.ts:12-22` ↔ `:45-57` (13 líneas)
- **`routes/my/competitions/$id/stages/$stageId/events/$eventId/index.tsx`** duplicado consigo mismo — líneas 483-493 ↔ 511-521 (11 líneas), archivo ya identificado arriba como candidato a split por tamaño (912 líneas).

### B. Configuración / build / test (bajo riesgo, revisar si es intencional)

- `ui/app/vitest.config.ts:7-15` ↔ `ui/library/vitest.config.ts:7-15` (9 líneas) — podrían compartir una config base en `configuration/`.
- `ui/app/scripts/prefix-build-paths.mjs` triplicado con `offlinePreloadManifest.ts` (dos clones, 12 y 13 líneas) — mismo parsing de rutas replicado entre el script de build y el runtime.
- `ui/app/scripts/prefix-build-paths.mjs:33-40` ↔ `:50-57` (8 líneas, mismo archivo).
- CSS duplicado: `icon-toggle-button/styles.css:1-19` ↔ `classification-card/styles.css:140-157` (19 líneas); `stages/$id/events/$eventId/styles.css:39-60` ↔ `stages/styles.css:18-39` (22 líneas).
- `ui/app/playwright/api-mocks/collections.ts` duplicado consigo mismo dos veces (setup de mocks `NotCompeting`/`Scoring`, 17 líneas cada uno) — extraer un helper `setupCollectionMock(overrides)`.
- `ui/app/smoke/utils/flows.ts` triplicado internamente (tres clones, 6-7 líneas) — helper de flujo repetido.
- `ui/app/src/routeTree.gen.ts:182-231 ↔ 234-344` (111 líneas) — **archivo autogenerado por TanStack Router, ignorar** (no editar a mano).

---

## 5. Recomendación de orden de trabajo

1. Quick wins de la sección 0 (dependencias + imports) — trivial, hazlo en un commit aparte.
2. Extraer el helper compartido de `dup:5bfa4f07` entre los 5 `*CrudOfflineUtils.ts` — toca directamente uno de los refactoring targets (`competitionCrudOfflineUtils.ts`) y reduce duplicación de una sola vez.
3. Atacar las 3 funciones `merge*WithPayload` / `toApiCompetitor` / `toDogListItem` (las críticas de CRAP > 200) — son las de mayor riesgo real de bugs por complejidad ciclomática.
4. Unificar `stages/$id/info.tsx` y `stages/index.tsx` (67 líneas duplicadas + varias funciones moderadas de complejidad en ambos) en un componente compartido.
5. Romper los 4 ciclos de import, empezando por `competitionCrud.ts ↔ competitionCrudOfflineUtils.ts` (el más simple, longitud 2) antes que los de `auth.ts`/`*.types.ts` (más extendidos y arriesgados).
6. Revisar `routeTree.gen.ts` y `.storybook/withDarkTheme.decorator.ts` — el primero es generado (ignorar), el segundo es código propio con 3 funciones de alta complejidad que vale la pena revisar en una pasada dedicada a Storybook.
7. El resto de duplicados y moderados: ir resolviéndolos oportunistamente al tocar cada archivo, no como bloque dedicado.

## Notas

- MI global de 91.4 es "good" — este no es un proyecto con problemas estructurales graves, son puntos calientes localizados.
- 0% dead code — no hay limpieza de código muerto pendiente.
- Considerar `fallow init --agents` (genera guía para agentes) y `fallow hooks install --target agent` (gate de commit) si se quiere prevenir regresiones futuras automáticamente.
