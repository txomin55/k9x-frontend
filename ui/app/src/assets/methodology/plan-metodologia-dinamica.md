# Plan · Documentación visual de metodología OBDX dinámica (endpoint + SolidJS)

Objetivo: convertir la página estática `obdx-metodologia-visual.html` en una vista SolidJS alimentada por un
endpoint del backend, con **selector de federación** y **escala de rangos que deshabilita las letras que la
federación seleccionada no puede alcanzar**. El contrato de datos es el fichero
`obdx-methodology-data.json` ya existente (claves en inglés, sin colores).

**Principio rector**: el endpoint sirve **dominio puro**; toda la presentación (colores, tipografía, prosa,
plantillas de tooltips) vive en el frontend. El endpoint se **ensambla desde el código de dominio**, nunca
desde un fichero estático — así la doc no puede desincronizarse del comportamiento real (caso tier 2:
1 vs 2 extranjeros).

---

## 1. Arquitectura

```
k9x-backend                                  k9x-frontend (SolidJS)
┌──────────────────────────────┐             ┌─────────────────────────────────┐
│ GET /api/obdx/methodology    │──── JSON ──▶│ createResource(fetchMethodology)│
│                              │             │                                 │
│ Ensambla la respuesta desde: │             │ señales: federation, lang       │
│ · ObdxConfigurationsRank-    │             │                                 │
│   Thresholds (franjas)       │             │ <FederationSelector/>           │
│ · ObdxRank (rangos de letra, │             │ <RankScale/>        (SVG-JSX)   │
│   tope 900)                  │             │ <TierChart/>        (Chart.js)  │
│ · ObdxEventRank (tiers,      │             │ <MeritCurve/>       (Chart.js)  │
│   extranjeros necesarios)    │             │ <DecayCurves/>      (Chart.js)  │
│ · ObdxCompetitorEventScore   │             │ <IndexExample/>     (Chart.js)  │
│   (curva de mérito)          │             │ <SlotFilling/>      (SVG-JSX)   │
│ · Constantes del índice      │             │ i18n: ficheros es.ts / en.ts    │
│   (curvas, N, C, relleno)    │             └─────────────────────────────────┘
└──────────────────────────────┘
```

---

## 2. Backend · `GET /api/obdx/methodology`

### 2.1 Fuente de cada bloque del JSON

| Bloque JSON | Fuente en dominio | Nota |
|---|---|---|
| `globalScale.ranges` | `ObdxRank` (`fromScore`, rangos por letra) | Incluir `automaticCap = ObdxRank.MAX_AUTOMATIC_SCORE` y la marca `alwaysInternational` de S |
| `international.foreignersByTier` | `ObdxEventRank.requiredForeignCompetitors` | **Única fuente de verdad** del 1/1/2/3/4 |
| `international.foreignDefinition` / `threshold` | Constantes de texto (ver §5, decidir si van aquí o al i18n del front) |
| `federations[].grades[]` | `ObdxConfigurationsRankThresholds` | Agrupar por federación parseando el `configuration_id` (`OBDX_FCI_*`, `OBDX_ENCI_*`, `OBDX_RSCE_*`, `CPC_*`), ignorando sufijo de versión `\.V\d+$` |
| `grades[].tiers[].nationalRankScore` / `internationalRankScore` | `ObdxConfigurationsRankThresholds.eventScore(...)` evaluado por tier | Computado, no tabla dura: el baremos sale de la fórmula |
| `grades[].possibleLetters` | `ObdxRank.fromScore` sobre min/max de la franja | Computar, incluir `letterCrossover` si la franja cruza frontera de letra |
| `meritCurve` | `ObdxCompetitorEventScore` + `qualifications` del `configuration.json` de GRADE_3 | Fase 1: fijo a GRADE_3 / eventScore 800 (ver §6) |
| `decayCurves` | Constantes de las curvas del índice (anclajes nivel/frescura, mesetas, suelos) | Donde vivan las curvas del spec del índice |
| `indexExample` | **Estático en backend** (fixture) | Narrativa didáctica de 4 perfiles (A jubilado, B progresión, C estable top, D estable estándar); los scores de cada prueba se derivan de la curva de mérito, no se inventan |

### 2.2 Decisiones de contrato

- **Quitar `band.range`**: es derivado (`max − min`); que lo calcule el consumidor. Evita el clásico derivado
  desincronizado. Mismo criterio ya aplicado a los colores.
- Mantener `tiers[]` **duplicado por grado** (decisión ya tomada): simplifica el frontend a costa de peso,
  y el peso es trivial (~15 KB).
- `bonusValue` + `bonusValueUnit: "%"` como quedó. Dentro de `internationalBonus` mantener también `points`
  (absoluto ya redondeado) porque es lo que pinta la gráfica de tiers sin recalcular.
- Los textos `{es, en}` que queden en el JSON (`foreignDefinition`, `threshold`, `description`, notas) son
  los únicos con prosa. Si se decide que toda la prosa va al front (§5), sustituirlos por claves
  (`"foreignDefinitionKey": "international.foreignDefinition"`).
- **Versionar la respuesta**: campo raíz `"schemaVersion": 1`. La doc visual y el endpoint evolucionarán.

### 2.3 Implementación

- Caso de uso `GetObdxMethodologyServiceCase` en `k9x-backend-application` → ensambla el DTO.
- Sin BD: todo sale de enums/constantes de `k9x-backend-domain`. Respuesta cacheable
  (`Cache-Control: public, max-age=86400` o ETag por versión de build).
- `BigDecimal` con `HALF_UP` para los puntos computados de la curva de mérito, 2 decimales — igual que
  `ObdxCompetitorEventScore`.
- Test de contrato: snapshot del JSON serializado contra un golden file. Si alguien toca una franja o el
  umbral de extranjeros, el test canta y obliga a regenerar el golden — la doc nunca miente.

---

## 3. Frontend · estructura SolidJS

```
src/features/methodology/
├── api.ts                  // fetchMethodology(): Promise<Methodology>
├── types.ts                // tipos TS espejo del contrato (generar de JSON Schema si se puede)
├── i18n/es.ts, en.ts       // TODA la prosa y plantillas de tooltips (§5)
├── theme.ts                // colores de letra E–S (bg/fg), azul/naranja/gris de las series
├── MethodologyPage.tsx     // createResource + layout + <FederationSelector/> + <LangToggle/>
├── components/
│   ├── FederationSelector.tsx
│   ├── RankScale.tsx       // SVG-JSX
│   ├── TierChart.tsx       // Chart.js (barras apiladas por grado)
│   ├── MeritCurve.tsx      // Chart.js
│   ├── DecayCurves.tsx     // Chart.js
│   ├── SlotFilling.tsx     // SVG-JSX (relleno C)
│   └── IndexExample.tsx    // Chart.js (dos perros)
└── charts/useChart.ts      // wrapper onMount/createEffect + chart.destroy() en onCleanup
```

Estado global de la página: dos señales, `federation: Accessor<FederationId>` (default `"FCI"`) y
`lang: Accessor<"es"|"en">`. Nada más. Todo lo demás son `createMemo` derivados.

### 3.1 Chart.js en Solid

- Un solo wrapper `useChart(canvasRef, () => config)`: crea el chart en `onMount`, `createEffect` sobre la
  config reactiva hace `chart.data = ...; chart.options = ...; chart.update()`, y `onCleanup` →
  `chart.destroy()`. No recrear el chart al cambiar idioma/federación: mutar y `update()` (transición suave
  gratis).
- Alternativa aceptable: `solid-chartjs`. Solo si no estorba con el tooltip callback custom.

### 3.2 Tokens de marca

- `theme.ts` con los colores de rango exactos (E `rgb(254,226,226)`/`#b91c1c` … S
  `rgb(237,233,254)`/`#6d28d9`) — salieron del JSON a propósito; este es su sitio.
- Tipografía: Barlow Condensed 900 para headers/eyebrows, Barlow para cuerpo. Mismo layout que el HTML
  actual (que sirve de referencia visual 1:1).

---

## 4. Lógica del selector de federación

### 4.1 Letras habilitadas

```ts
const enabledLetters = createMemo(() => {
  const fed = data().federations.find(f => f.id === federation());
  const letters = new Set(
    fed.grades.flatMap(g => g.possibleLetters.map(l => l.replace("+", "")))
  );
  return letters; // FCI → {D,C,B,A} · ENCI → {E} · RSCE → {E,D} · CPC → {E}
});
```

- `<RankScale/>`: letra deshabilitada → segmento con `opacity: .25` + `filter: grayscale(1)`, sin tooltip.
  **S solo habilitada en las federaciones con configuración Special Events** y con tooltip propio
  explicando que es exclusiva de esa configuración — es información, no ruido.
- Las franjas de configuración que se pintan bajo la escala: **solo las de la federación seleccionada**.
  Posicionamiento lineal `x = pad + value * scale` desde `band.min/max` — cero coordenadas hardcodeadas.

### 4.2 Grados y gráfica de tiers

- El selector de federación filtra; dentro, **tabs de grado** (FCI tiene 3, ENCI 2, RSCE 2, CPC 1).
- `<TierChart/>` recibe el grado activo: barras desde `tiers[].nationalRankScore` (base transparente en
  `band.min`, tramo tier en azul, tramo internacional en ámbar usando `internationalBonus.points`).
  Eje Y: `[band.min − 5, band.max + 5]`.
- La tabla de tiers (competidores / % / extranjeros) se renderiza del mismo array — desaparece la
  duplicación manual del HTML.

### 4.3 Qué NO reacciona al selector

`DecayCurves`, `SlotFilling` e `IndexExample` son **de disciplina, no de federación**: se quedan fijos.
Documentarlo con una línea en la UI ("el índice es común a todas las federaciones") para que nadie lo
perciba como bug.

---

## 5. i18n y tooltips: reparto de responsabilidades

**Regla**: datos en el endpoint, palabras en el frontend.

Al frontend (`i18n/es.ts`, `en.ts`):
- Ledes, notas, subtítulos y títulos de sección (todo el diccionario `I` del HTML actual — migrar tal cual).
- **Plantillas de tooltips** con parámetros, una por gráfica:
  - `tier.tooltipNational`: `"nacional: {score}"` / `"national: {score}"`
  - `merit.tooltip`: `"total {x} → score {y}"`
  - `decay.tooltip`: `"{serie}: mes {month} → {weight}"`
  - `dogs.lineTooltip`: `"{dog}: mes {month} → índice {index}"`
  - `dogs.eventTooltip`: `"prueba de {points} puntos (mes {month}) → índice {index}"`
- Mapeo de calificativos por idioma: ES muestra `id` (B/MB/EXC), EN muestra `nameEn` (G/VG/EXC) — el dato
  ya viene en `meritCurve.context.qualifications`, el front solo elige el campo.

Pendiente de decisión (dueño: Txomin): los dos textos largos que hoy van en el JSON
(`international.foreignDefinition`, `threshold`). Recomendación: moverlos también al front y dejar el
endpoint 100 % numérico. Solo mantenerlos en el JSON si la doc debe ser editable sin desplegar frontend.

---

## 6. Curva de mérito: fase 1 fija, fase 2 por configuración

- **Fase 1**: el bloque `meritCurve` llega fijo (GRADE_3, eventScore 800) y el componente lo pinta
  independiente del selector, con su contexto visible ("Evento FCI Grade 3 · eventScore = 800").
- **Fase 2** (cuando haya `qualifications` con `name_en` en todos los `configuration.json`): el endpoint
  expone `meritCurve` **por configuración** (o solo los parámetros: `qualifications`, `bandMin`,
  `kneeShare`, `unlockPct`, `maxScore`) y el front computa los puntos — la fórmula es cerrada y trivial en
  cliente. Entonces la curva sí reacciona al grado seleccionado, con un input opcional de `eventScore`
  (slider entre `nationalRankScore(tier1)` y `band.max`) que enseña cómo el techo depende del evento.
  Esta fase es la que más valor didáctico añade; no bloquear la fase 1 por ella.

---

## 7. Fases y criterios de aceptación

### Fase 0 — Contrato (½ día)
- [ ] Quitar `band.range` del JSON; añadir `schemaVersion`.
- [ ] Congelar `obdx-methodology-data.json` como fixture/golden y generar `types.ts`.
- **Acepta**: el JSON valida contra un JSON Schema versionado en el repo.

### Fase 1 — Endpoint (1–2 días)
- [ ] `GetObdxMethodologyServiceCase` ensamblando desde `ObdxRank`, `ObdxConfigurationsRankThresholds`,
      `ObdxEventRank` y constantes del índice; `indexExample` como fixture.
- [ ] Test snapshot contra el golden.
- **Acepta**: `curl /api/obdx/methodology` ≡ golden byte a byte (salvo orden de claves).

### Fase 2 — SPA SolidJS (2–3 días)
- [ ] Página con `createResource`, toggle ES/EN, selector de federación con tabs de grado.
- [ ] Los 6 componentes renderizando **solo** desde el JSON; paridad visual con el HTML actual
      (el HTML queda como referencia y luego se archiva).
- [ ] Letras deshabilitadas según §4.1; S siempre atenuada con tooltip.
- **Acepta**: cambiar de federación actualiza escala + franjas + tiers sin recarga; cambiar de idioma
  no recrea los charts (solo `update()`); ninguna cifra hardcodeada en JSX (grep de `201|384|744` en
  componentes = 0 resultados fuera de tests).

### Fase 3 — Mérito dinámico (posterior, opcional)
- [ ] §6 fase 2.

---

## 8. Fuera de alcance

- Persistencia o BD para la metodología (todo sale de código).
- Editor/CMS de textos (si algún día hace falta, se revisita §5).
- Cualquier cambio en el cálculo real de índices/scores: esta vista es **solo lectura del dominio**.

## 9. Riesgos conocidos

| Riesgo | Mitigación |
|---|---|
| Docs `.md` y enum desincronizados (tier 2 = 1 vs 2) | El endpoint lee del enum; corregir los `.md` y `requiredForeignCompetitors` **antes** de la fase 1 para que el golden nazca correcto |
| Chart.js + reactividad Solid (charts zombis) | Wrapper único `useChart` con `onCleanup`; prohibido instanciar `new Chart` fuera de él |
| Ejemplo de perros queda obsoleto si cambian las curvas del índice | El fixture `indexExample` vive junto a las constantes de curvas y su test recalcula 3 puntos de control (arranque de A = 700.0, sprint final de B = 654.5, pico de C = 746.3) con la implementación real |
