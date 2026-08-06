# Contrato de los endpoints de metodología

Qué tiene que devolver el backend para las dos páginas de metodología. Hoy el
frontend lee dos ficheros estáticos que son **el golden de este contrato**:

| Endpoint futuro | Fichero actual | Página |
|---|---|---|
| `GET /obdx/methodology` | `static/methodology/obdx.json` | `/methodology/obdx` |
| `GET /k9x/methodology` | `static/methodology/k9x.json` | `/methodology/k9x` |

El espejo en TypeScript de ambos está en
`src/features/methodology/types.ts` — si el endpoint no valida contra esos
tipos, la página se rompe.

## Reglas que aplican a los dos

- **`schemaVersion` en la raíz**, entero. Hoy `1`. Cualquier cambio que rompa a
  un consumidor lo incrementa.
- **Sin campos derivados.** Nada de `range: max − min`, nada de porcentajes que
  se puedan calcular desde otro campo del mismo payload. El consumidor deriva.
- **Sin prosa.** Ledes, notas y pies de figura viven en
  `static/locales/{es,en}/translation.json` bajo `METHODOLOGY.*` e interpolan
  las cifras del payload. El endpoint es numérico.
- **Excepción: los nombres de entidad** van bilingües inline como
  `{ "es": "…", "en": "…" }` (nombres de configuración, nombres de perro del
  ejemplo). Son filas de datos, no copy de página: una clave i18n por fila
  obligaría a tocar los locales cada vez que se añade una configuración.
- **Sin colores ni coordenadas.** El endpoint dice `letter: "S"`; que S sea
  violeta lo decide `src/features/methodology/theme.ts`.
- **Todo se ensambla desde el dominio**, nunca desde un fichero estático: las
  franjas desde `ObdxConfigurationsRankThresholds`, las letras desde `ObdxRank`,
  los extranjeros por tier desde `ObdxEventRank`. Así la doc no puede
  desincronizarse del cálculo real.
- Respuesta cacheable (`Cache-Control: public, max-age=86400` o ETag por versión
  de build). No depende del usuario ni de la petición.

---

## `GET /obdx/methodology`

```jsonc
{
  "schemaVersion": 1,
  "globalScale": { … },
  "international": { … },
  "federations": [ … ],
  "meritCurve": { … }
}
```

### `globalScale`

La escala 0–1000 y sus seis letras. Fuente: `ObdxRank`.

```jsonc
{
  "min": 0,
  "max": 1000,
  "automaticCap": 900,          // ObdxRank.MAX_AUTOMATIC_SCORE: la fórmula nunca lo supera
  "internationalSuffix": "+",
  "ranges": [
    { "letter": "E", "min": 0,   "max": 200 },
    { "letter": "D", "min": 201, "max": 400 },
    { "letter": "C", "min": 401, "max": 600 },
    { "letter": "B", "min": 601, "max": 800 },
    { "letter": "A", "min": 801, "max": 900 },
    { "letter": "S", "min": 901, "max": 1000,
      "manual": true, "alwaysInternational": true }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `min` / `max` | `int` | Extremos de la escala global. |
| `automaticCap` | `int` | Techo que puede alcanzar la fórmula. |
| `internationalSuffix` | `string` | Sufijo de letra internacional. |
| `ranges[].letter` | `"E"\|"D"\|"C"\|"B"\|"A"\|"S"` | Ordenadas de menor a mayor. |
| `ranges[].min` / `max` | `int` | Inclusivos y contiguos: `min` = `max` anterior + 1. |
| `ranges[].manual` | `bool?` | Solo `true` en S. La página la pinta atenuada. |
| `ranges[].alwaysInternational` | `bool?` | Solo `true` en S. |

Las seis letras deben venir siempre, aunque la federación seleccionada no pueda
alcanzarlas: quién puede llegar a cada una se deduce de `possibleLetters`.

### `international`

El bonus internacional y el mínimo de extranjeros por tier. Fuente:
`ObdxEventRank.requiredForeigners` — **única fuente de verdad** de esta tabla.

```jsonc
{
  "bonusValue": 10,
  "bonusValueUnit": "%",
  "foreignersByTier": [
    { "tier": 1, "competitors": { "min": 1,  "max": 4    }, "requiredForeigners": 1 },
    { "tier": 2, "competitors": { "min": 5,  "max": 9    }, "requiredForeigners": 1 },
    { "tier": 3, "competitors": { "min": 10, "max": 19   }, "requiredForeigners": 2 },
    { "tier": 4, "competitors": { "min": 20, "max": 34   }, "requiredForeigners": 3 },
    { "tier": 5, "competitors": { "min": 35, "max": null }, "requiredForeigners": 4 }
  ]
}
```

`competitors.max` es `null` **solo** en el último tier — así el frontend sabe que
esa fila se etiqueta «≥ 35» y no «35 – X». Los cinco tiers siempre presentes y
ordenados por `tier` ascendente.

### `federations[]`

Una entrada por federación, con sus configuraciones. Fuente:
`ObdxConfigurationsRankThresholds`, agrupando por el prefijo del
`configuration_id` (`OBDX_FCI_*`, `OBDX_ENCI_*`, `OBDX_RSCE_*`, `CPC_*`) e
ignorando el sufijo de versión `\.V\d+$`.

```jsonc
{
  "id": "FCI",
  "name": "Fédération Cynologique Internationale",
  "grades": [ … ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | Corto: es lo que se ve en el combo. Hoy `FCI`, `ENCI`, `RSCE`, `CPC`. |
| `name` | `string` | Nombre largo, **no** bilingüe: es un nombre propio. |
| `grades` | `Grade[]` | Al menos una. Orden de presentación. |

El frontend arranca en `FCI`; si esa federación desaparece cae en la primera del
array, así que el orden importa.

#### `federations[].grades[]`

```jsonc
{
  "id": "OBDX_FCI_GRADE_1",
  "name": { "es": "FCI Grade 1", "en": "FCI Grade 1" },
  "band": { "min": 201, "max": 400 },
  "possibleLetters": ["D", "D+"],
  "internationalBonus": { "bonusValue": 10, "bonusValueUnit": "%", "points": 20 },
  "tiers": [ … ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | El `configuration_id` sin versión. Se cruza con `meritCurve.context.configuration`. |
| `name` | `{es,en}` | Etiqueta del combo y de la franja en la escala. |
| `band.min` / `max` | `int` | Franja de la configuración dentro de 0–1000. **Sin `range`**. |
| `possibleLetters` | `string[]` | Letras alcanzables, con y sin sufijo (`["B","B+","A","A+"]`). Computado con `ObdxRank.fromScore` sobre los extremos de la franja. De aquí sale el atenuado de la escala. |
| `internationalBonus.bonusValue` / `Unit` | `int` / `string` | Redundante con `international`, pero por grado. |
| `internationalBonus.points` | `int` | El bonus **en puntos absolutos ya redondeados** para esta franja. Es lo que pinta la gráfica sin recalcular. |
| `tiers` | `Tier[]` | Exactamente 5, ordenados por `tier`. |

`tiers[]` se duplica en cada grado a propósito: pesa poco (~15 KB en total) y
evita que el frontend tenga que recomputar el baremo.

#### `federations[].grades[].tiers[]`

```jsonc
{
  "tier": 1,
  "competitors": { "min": 1, "max": 4 },
  "requiredForeigners": 1,
  "tierContributionPctOfRange": 18,
  "nationalRankScore": 237,
  "nationalLetter": "D",
  "internationalRankScore": 257,
  "internationalLetter": "D+"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `tier` | `1..5` | |
| `competitors` | `{min:int, max:int\|null}` | `null` en el tier 5. Coincide con `international.foreignersByTier`. |
| `requiredForeigners` | `int` | Idem. |
| `tierContributionPctOfRange` | `int` | `tier/5 × 90`, en % del range. |
| `nationalRankScore` | `int` | `ObdxConfigurationsRankThresholds.eventScore(...)` evaluado en ese tier. **Computado desde la fórmula, no tabla dura.** |
| `nationalLetter` | `string` | Letra derivada de `nationalRankScore`. |
| `internationalRankScore` | `int` | `nationalRankScore + internationalBonus.points`. |
| `internationalLetter` | `string` | Con sufijo. Puede saltar de letra (Grade 3 cruza B→A en 800). |

La gráfica de tiers dibuja `nationalRankScore − band.min` en azul y
`internationalRankScore − nationalRankScore` en ámbar, sobre una base
transparente en `band.min`. Si esas restas salen negativas, el payload es
incoherente.

### `meritCurve`

La curva que convierte la nota del competidor en `competitorEventScore`. Hoy
**fija a un evento de ejemplo** (`OBDX_FCI_GRADE_3`, `eventScore` 800): el
frontend la pinta tal cual, no reacciona al combo.

```jsonc
{
  "context": {
    "configuration": "OBDX_FCI_GRADE_3",
    "eventScore": 800,
    "band": { "min": 601, "max": 900 },
    "maxScore": 320,
    "qualifications": [
      { "id": "B",   "nameEn": "G",   "score": 192 },
      { "id": "MB",  "nameEn": "VG",  "score": 224 },
      { "id": "EXC", "nameEn": "EXC", "score": 256, "top": true }
    ],
    "parameters": {
      "unlockPct": 10,
      "kneeShare": 0.85,
      "floorBelowFirstQualification": 600
    }
  },
  "series": [
    { "id": "floor", "points": [ { "x": 150, "y": 600 }, { "x": 191, "y": 600 } ] },
    { "id": "curve", "points": [
      { "x": 192, "y": 620.9 }, { "x": 224, "y": 697.02 }, { "x": 256, "y": 773.14 },
      { "x": 288, "y": 786.57 }, { "x": 320, "y": 800 } ] },
    { "id": "knee",  "points": [ { "x": 256, "y": 773.14 } ] }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `context.configuration` | `string` | Debe existir como `grades[].id`: el frontend lo cruza para poner el nombre en el título. |
| `context.eventScore` | `int` | Techo de la curva. |
| `context.band` | `{min,max}` | La franja de esa configuración. |
| `context.maxScore` | `int` | Nota máxima del competidor (320 en FCI). Manda en el eje X y en el `stepSize` (`maxScore/10`). |
| `context.qualifications[]` | `{id, nameEn, score, top?}` | Ordenados por `score`. `id` se muestra en ES, `nameEn` en EN. Exactamente uno con `top: true`. |
| `parameters.unlockPct` | `int` | % que desbloquea llegar al primer calificativo. |
| `parameters.kneeShare` | `float` | Fracción de la ventana ganada en la rodilla (0.85 → «85 %»). |
| `parameters.floorBelowFirstQualification` | `int` | Suelo de quien no llega al primer calificativo. |
| `series[]` | 3 entradas | `id` ∈ `floor` \| `curve` \| `knee`, **los tres obligatorios**; el frontend los busca por `id`, no por posición. |

Los `x` de `curve` son notas del competidor y los `y` su `competitorEventScore`.
`knee` es un único punto que debe coincidir con el punto de `curve` en el
calificativo `top`. El primer `x` de `floor` fija el mínimo del eje X.

---

## `GET /k9x/methodology`

```jsonc
{
  "schemaVersion": 1,
  "indexScale": { "min": 0, "max": 1000 },
  "decayCurves": { … },
  "indexExample": { … }
}
```

`indexScale` es el eje Y de la gráfica de perfiles: la escala del índice, la
misma 0–1000 del rank_score.

### `decayCurves`

Las dos curvas de peso por antigüedad. Fuente: las constantes de las curvas del
spec del índice.

```jsonc
{
  "series": [
    { "id": "level", "plateauMonths": 8,
      "floor": { "fromMonth": 56, "value": 0.01 },
      "anchors": [ { "month": 0, "weight": 1.0 }, { "month": 8, "weight": 1.0 },
                   { "month": 14, "weight": 0.85 }, … { "month": 56, "weight": 0.01 } ] },
    { "id": "freshness", "plateauMonths": 6,
      "floor": { "fromMonth": 58, "value": 0.01 },
      "anchors": [ … ] }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `series[].id` | `"level"` \| `"freshness"` | Las dos obligatorias; el frontend las busca por `id` y les asigna color y estilo de línea. |
| `plateauMonths` | `int` | Meses de meseta a peso 1. Sale en el pie de figura. |
| `floor.fromMonth` / `floor.value` | `int` / `float` | Mes a partir del cual el peso se queda plano y su valor. |
| `anchors[]` | `{month:int, weight:float}[]` | Ordenados por `month` ascendente. El primero en `month: 0` con `weight: 1.0`, el último en `floor.fromMonth` con `floor.value`. |

El frontend prolonga la curva un poco más allá del último ancla reutilizando
`floor.value`, así que no hace falta mandar la cola plana.

### `indexExample`

Fixture narrativo de cuatro perfiles de carrera. Es didáctico: **puede vivir
como fixture en el backend**, pero sus cifras se derivan de las curvas y de la
curva de mérito reales, no se inventan.

```jsonc
{
  "formula": "index = level × freshness",
  "parameters": {
    "N": 3,
    "C": 201,
    "cReference": { "es": "Suelo de la franja FCI Grade 1", "en": "FCI Grade 1 band floor" },
    "filler": "min(C, bestContribution)",
    "provisionalIfResultsBelow": 3
  },
  "slotFilling": { "cases": [ … ] },
  "dogs": [ … ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `formula` | `string` | Expresión, no prosa traducible. |
| `parameters.N` | `int` | Denominador fijo del nivel. Manda cuántas plazas dibuja el bloque de relleno. |
| `parameters.C` | `int` | Valor del relleno. |
| `parameters.cReference` | `{es,en}` | De dónde sale C. Se interpola en el pie de figura. |
| `parameters.filler` | `string` | Expresión del relleno. |
| `parameters.provisionalIfResultsBelow` | `int` | Umbral de índice provisional. |

#### `indexExample.slotFilling.cases[]`

```jsonc
[
  { "id": "one-result",    "results": [750],           "slots": [750, 201, 201], "level": 384 },
  { "id": "two-results",   "results": [750, 750],      "slots": [750, 750, 201], "level": 567 },
  { "id": "three-results", "results": [750, 750, 750], "slots": [750, 750, 750], "level": 750 },
  { "id": "weak-result",   "results": [200],           "slots": [200, 200, 200], "level": 200 }
]
```

**El orden es contrato**: los primeros `N` casos son la rampa (1, 2, … `N`
resultados) y se pintan como columnas; el caso `N+1` es el que ilustra que
`min(C, mejor contribución)` hace de C un techo y no un suelo, y se renderiza
como la línea de texto de debajo. Manda al menos `N+1` casos.

En cada caso, `slots` tiene siempre `N` elementos: los primeros
`results.length` son resultados reales y el resto relleno — de ahí saca el
frontend qué caja pinta en azul y cuál con borde discontinuo.

#### `indexExample.dogs[]`

```jsonc
{
  "id": "dogA",
  "name": { "es": "Perro A (se jubila)", "en": "Dog A (retires)" },
  "results": [ { "month": 0, "score": 750.0 }, … ],
  "series":  [ { "month": 0, "index": 700.0 }, … ],
  "events":  [ { "month": 0, "index": 700.0, "score": 700.0,
                 "label": "3 × G3 · scores 750/700/650" } ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | Estable: `theme.ts` mapea `dogA…dogD` a su color. Un id nuevo cae al color por defecto. |
| `name` | `{es,en}` | Etiqueta de leyenda y de tooltip. |
| `results[]` | `{month, score}[]` | Score de cada prueba. Se pintan como puntos tenues. Varias entradas pueden compartir `month`. |
| `series[]` | `{month, index}[]` | La línea del índice. Ordenada por `month`; **se permiten dos puntos con el mismo `month`** — es el salto vertical justo antes/después de una prueba. |
| `events[]` | `{month, index, score, label}[]` | Puntos sólidos. `label` es una etiqueta técnica corta (`"G3 250/320 · ev.750"`), no traducible. |

Con un solo `event` el frontend interpreta que el perro se jubila y dibuja su
línea discontinua. Los `index` de `events` tienen que coincidir con el punto
correspondiente de `series`.

---

## Test de contrato

Snapshot del JSON serializado contra un golden file. Si alguien toca una franja,
el umbral de extranjeros o una curva, el test canta y obliga a regenerar el
golden — la doc nunca miente. Los dos ficheros de `static/methodology/` sirven
como golden inicial.

Del lado del frontend, el cambio para dejar de leer el estático es una línea en
`src/features/methodology/api.ts` (el `fetch` pasa a `rawRequest`); conviene
revisar entonces el `staleTime: Infinity`, que solo es cierto para un fichero
versionado por build.
