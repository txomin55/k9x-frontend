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

- **`schemaVersion` en la raíz**, entero y **por endpoint**: hoy `2` en OBDX y
  `1` en K9X. Cualquier cambio que rompa a un consumidor lo incrementa; añadir
  una federación o una configuración no lo es.
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
  franjas y sus sub-bandas desde `ObdxConfigurationsRankThresholds`, las letras
  desde `ObdxRank`, las categorías desde `ObdxEventCategory`, los tiers desde
  `ObdxConfigurationsRankThresholds.tierFromCompetitorCount` y la curva de mérito
  desde `ObdxCompetitorEventScore`. Así la doc no puede desincronizarse del
  cálculo real.
- Respuesta cacheable (`Cache-Control: public, max-age=86400` o ETag por versión
  de build). No depende del usuario ni de la petición.

---

## `GET /obdx/methodology`

`schemaVersion: 2`.

```jsonc
{
  "schemaVersion": 2,
  "globalScale": { … },
  "tiers": [ … ],
  "categories": [ … ],
  "federations": [ … ],
  "meritCurve": { … }
}
```

> **Qué cambió de v1 a v2.** Desapareció el bloque `international` y el
> `internationalBonus` de cada grado: el bonus internacional ya no existe en el
> dominio, y con él se fueron el sufijo `+` de las letras y los cinco tiers por
> número de extranjeros. En su lugar entra la **categoría** del evento
> (`ObdxEventCategory`), que parte la franja de la configuración en sub-bandas, y
> los tiers pasan a ser **tres y por número de competidores**. Por eso la raíz
> tiene dos bloques nuevos —`tiers` y `categories`— y los tiers dejan de colgar
> del grado para colgar de cada categoría del grado.

### `globalScale`

La escala 0–1000 y sus seis letras. Fuente: `ObdxRank.fromScore`.

```jsonc
{
  "min": 0,
  "max": 1000,
  "ranges": [
    { "letter": "E", "min": 0,   "max": 200 },
    { "letter": "D", "min": 201, "max": 400 },
    { "letter": "C", "min": 401, "max": 600 },
    { "letter": "B", "min": 601, "max": 800 },
    { "letter": "A", "min": 801, "max": 900 },
    { "letter": "S", "min": 901, "max": 1000 }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `min` / `max` | `int` | Extremos de la escala global. |
| `ranges[].letter` | `"E"\|"D"\|"C"\|"B"\|"A"\|"S"` | Ordenadas de menor a mayor. |
| `ranges[].min` / `max` | `int` | Inclusivos y contiguos: `min` = `max` anterior + 1. |

Las seis letras deben venir siempre, aunque la configuración seleccionada no
pueda alcanzarlas: quién llega a cada una se deduce de `possibleLetters`, y la
página pinta atenuado el resto. La `S` solo la alcanza la final del mundial
(`WC_FINAL`, un 1000 fijo), así que en casi todas las configuraciones va
atenuada.

### `tiers`

El baremo de tiers por número de competidores, que es **global**: no depende de
la configuración ni de la categoría. Fuente:
`ObdxConfigurationsRankThresholds.tierFromCompetitorCount`.

```jsonc
[
  { "tier": 1, "competitors": { "min": 1,  "max": 9    } },
  { "tier": 2, "competitors": { "min": 10, "max": 24   } },
  { "tier": 3, "competitors": { "min": 25, "max": null } }
]
```

`competitors.max` es `null` **solo** en el último tier — así el frontend sabe que
esa fila se etiqueta «≥ 25» y no «25 – X». Los tres tiers siempre presentes y
ordenados por `tier` ascendente.

### `categories`

El catálogo de categorías de evento, con su nombre bilingüe. Fuente:
`ObdxEventCategory`, y `championship` desde `ObdxConfigurationsRankThresholds.allows`
(las `WC_*` solo las acepta el grado que acoge el mundial).

```jsonc
[
  { "id": "CLUB",     "name": { "es": "Club",             "en": "Club" },          "championship": false },
  { "id": "OPEN",     "name": { "es": "Open",             "en": "Open" },          "championship": false },
  { "id": "WC_Q",     "name": { "es": "Clasificatoria WC","en": "WC qualifier" },  "championship": true  },
  { "id": "WC_SEMI",  "name": { "es": "Semifinal WC",     "en": "WC semi-final" }, "championship": true  },
  { "id": "WC_FINAL", "name": { "es": "Final WC",         "en": "WC final" },      "championship": true  }
]
```

Las cinco siempre presentes y en ese orden. El frontend cruza por `id` lo que
viene en `federations[].grades[].categories[]`, así que un `id` sin entrada aquí
se pinta con su propio identificador y canta.

### `federations[]`

Una entrada por federación, con sus configuraciones. Fuente:
`ObdxConfigurationsRankThresholds`, agrupando por el prefijo del
`configuration_id` (`OBDX_FCI_*`, `OBDX_ENCI_*`, `OBDX_RSCE_*`, `OBDX_CPC_*`,
`OBDX_SPKL_*`, `OBDX_SCC_*`, `OBDX_SKK_*`, `OBDX_NKN_*`, `OBDX_VDH_*`,
`OBDX_OKV_*`) e ignorando el sufijo de versión `\.V\d+$`.

```jsonc
{
  "id": "FCI",
  "name": "Fédération Cynologique Internationale",
  "grades": [ … ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | Corto: es lo que se ve en el combo. Hoy `FCI`, `ENCI`, `RSCE`, `CPC`, `SPKL`, `SCC`, `SKK`, `NKN`, `VDH`, `OKV`. `NKN` es el código con el que la federación noruega entró en la aplicación; su nombre es Norsk Kennel Klub (NKK); `OKV` es la ÖKV austriaca, sin diéresis en el id. |
| `name` | `string` | Nombre largo, **no** bilingüe: es un nombre propio. |
| `grades` | `Grade[]` | Al menos una, ordenadas por `band.min` ascendente. |

El frontend arranca en `FCI`; si esa federación desaparece cae en la primera del
array, así que el orden importa.

Una federación que no tenga configuración propia **no sale**: las que corren solo
los grados FCI (DKK, LKF…) ya están representadas por `FCI`. El **VDH** y la
**ÖKV** sí salen desde que tienen las suyas: sus clases nacionales *Beginner* y
*Senioren*, que corren en la misma prueba que las tres de la FCI. La Beginner cae
en la franja de iniciación `[100, 200]` y la **Senioren en la del grado 2**
`[401, 600]`: es una clase de veteranos —perro de 8 años o más y sin vuelta
atrás— cuyo programa lleva identificación por olfato, cuadrado a 15 m y apporte
dirigido, y cuyo reglamento la agrupa con las clases 2 y 3.

#### `federations[].grades[]`

```jsonc
{
  "id": "OBDX_FCI_GRADE_3",
  "name": { "es": "FCI Grade 3", "en": "FCI Grade 3" },
  "band": { "min": 601, "max": 1000 },
  "possibleLetters": ["B", "A", "S"],
  "categories": [ … ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | El `configuration_id` sin versión y con `.` → `_`. Se cruza con `meritCurve.context.configuration`. |
| `name` | `{es,en}` | Etiqueta del combo y de la franja en la escala. |
| `band.min` / `max` | `int` | Franja de la configuración dentro de 0–1000. **Sin `range`**. |
| `possibleLetters` | `RankLetter[]` | Letras que toca la franja, de menor a mayor. Computado con `ObdxRank.fromScore` sobre los extremos. De aquí sale el atenuado de la escala. |
| `categories` | `GradeCategory[]` | Las que la configuración admite: `CLUB` y `OPEN` siempre; las tres `WC_*` solo el grado que acoge el mundial. Ordenadas por `subBand.min`. |

#### `federations[].grades[].categories[]`

La categoría no es una etiqueta: es el trozo de la franja al que opta la prueba.

```jsonc
{
  "id": "WC_Q",
  "subBand": { "min": 775, "max": 850 },
  "fixed": false,
  "tiers": [ … ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `CategoryId` | Debe existir en `categories[]` de la raíz. |
| `subBand.min` / `max` | `int` | `ObdxConfigurationsRankThresholds.subBand(category)`. En las configuraciones sin mundial, `CLUB` se lleva el 75 % bajo de la franja y `OPEN` el resto. |
| `fixed` | `bool` | `true` cuando `subBand.min == max` (semifinal y final del mundial): el tier no las mueve. El frontend lo usa para imprimir un solo score en vez de tres. |
| `tiers` | `GradeCategoryTier[]` | Exactamente tres, ordenados por `tier`, uno por entrada de `tiers` de la raíz. |

Las sub-bandas de una configuración **no tienen por qué cubrir la franja
entera**: en el grado 3 los huecos entre 750 y 775 y entre 850 y 900 son
deliberados — ahí no puntúa nada que no sea una ronda del mundial.

`tiers[]` se repite en cada categoría a propósito: pesa poco y evita que el
frontend recompute el baremo.

#### `federations[].grades[].categories[].tiers[]`

```jsonc
{
  "tier": 2,
  "competitors": { "min": 10, "max": 24 },
  "rankScore": 825,
  "letter": "A"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `tier` | `1..3` | |
| `competitors` | `{min:int, max:int\|null}` | `null` en el tier 3. Coincide con la entrada de `tiers` de la raíz. |
| `rankScore` | `int` | `ObdxConfigurationsRankThresholds.eventScore(competitorCount, category)` evaluado en ese tier: `subBand.min + round(tier/3 × (subBand.max − subBand.min))`. **Computado desde la fórmula, no tabla dura.** |
| `letter` | `RankLetter` | `ObdxRank.fromScore(rankScore)`. Puede cambiar dentro de una misma categoría: la clasificatoria del mundial cruza B→A en 800. |

El `rankScore` del tier nunca cae en `subBand.min`, y es deliberado: ese suelo es
también el punto desde el que se mide la puntuación de cada competidor. Si
`rankScore` sale igual al suelo de la sub-banda, o fuera de `[subBand.min,
subBand.max]`, el payload es incoherente.

### `meritCurve`

La curva que convierte la nota del competidor en su `competitorEventScore`.
Fuente: `ObdxCompetitorEventScore`. Hoy **fija a un evento de ejemplo** —la final
del mundial de grado 3, `eventScore` 1000—: el frontend la pinta tal cual, no
reacciona al combo de federación.

```jsonc
{
  "context": {
    "configuration": "OBDX_FCI_GRADE_3",
    "category": "WC_FINAL",
    "eventScore": 1000,
    "gradeFloor": 601,
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
      { "x": 192, "y": 640.9 }, { "x": 224, "y": 793.52 }, { "x": 256, "y": 946.14 },
      { "x": 288, "y": 973.07 }, { "x": 320, "y": 1000 } ] },
    { "id": "knee",  "points": [ { "x": 256, "y": 946.14 } ] }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `context.configuration` | `string` | Debe existir como `grades[].id`: el frontend lo cruza para poner el nombre en el título. |
| `context.category` | `CategoryId` | Debe existir en `categories[]`; da el nombre de la categoría en el título. |
| `context.eventScore` | `int` | Techo de la curva: el `rankScore` del evento de ejemplo. |
| `context.gradeFloor` | `int` | **El suelo del grado, no el de la sub-banda** (`band.min`). Todos los competidores de un grado se miden desde el mismo punto, así que suspender una final del mundial deja en el mismo sitio que suspender un concurso de club. |
| `context.maxScore` | `int` | Nota máxima del competidor (320 en FCI). Manda en el eje X y en el `stepSize` (`maxScore/10`). |
| `context.qualifications[]` | `{id, nameEn, score, top?}` | Ordenados por `score`. `id` se muestra en ES, `nameEn` en EN. Exactamente uno con `top: true`. Salen del `configuration.json` de la configuración. |
| `parameters.unlockPct` | `int` | % del span que desbloquea llegar al primer calificativo (`QUALIFICATION_UNLOCK_SHARE`). |
| `parameters.kneeShare` | `float` | Fracción de la ventana del 90 % ganada en la rodilla (0.85 → «85 %»). |
| `parameters.floorBelowFirstQualification` | `int` | Suelo de quien no llega al primer calificativo: `gradeFloor − 1`. |
| `series[]` | 3 entradas | `id` ∈ `floor` \| `curve` \| `knee`, **los tres obligatorios**; el frontend los busca por `id`, no por posición. |

Los `x` de `curve` son notas del competidor y los `y` su `competitorEventScore`,
con `span = eventScore − gradeFloor`. `knee` es un único punto que debe coincidir
con el de `curve` en el calificativo `top`. El primer `x` de `floor` fija el
mínimo del eje X.

---

## `GET /k9x/methodology`

`schemaVersion: 1`.

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
una sub-banda de categoría o una curva, el test canta y obliga a regenerar el
golden — la doc nunca miente. Los dos ficheros de `static/methodology/` sirven
como golden inicial.

Del lado del frontend, el cambio para dejar de leer el estático es una línea en
`src/features/methodology/api.ts` (el `fetch` pasa a `rawRequest`); conviene
revisar entonces el `staleTime: Infinity`, que solo es cierto para un fichero
versionado por build.
