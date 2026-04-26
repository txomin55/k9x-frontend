# Pendientes

- Crear my rankings. Donde puedes hacer sumas de eventos seleccionados. Y hacer análisis propios y poder compartirlos
- Postgresql https://supabase.com/dashboard/org/jdtxnyedrfjutiaadkwi

## MVP

- Ver como simplificar el modelo oas
- Offline retry con sw
- Terminar push manager
- Estado inicial de competicion será draft, añadir boton de ready para enviar notificaciones a colectores en cada cambio
- Permitir en clasificación publica modo tabla o modo resumen
- Hacer campos obligatorios para edición y creación
- Modificar URLs de colección para que cuelgue de events/id/collection
    - Lo mismo para la clasificación
- Collection max width a la row de score y empezar columnas de derecha a izquierda
- reemplazar /api por /secured
- meter newrelic
- Cuando se usa en get, hacer wrap de elemento con id y name + nombre identificador. Cuando se usa en post o put, usar
  dogid o eventid a secas. Hay que modificar contratos
- Mock de markers con estados diferentes
- Brwadcrumbs en clasificación e info
- Crear combobox para poder reemplazar los select de perros
    - Lo mismo paea participantes
    - Lo mismo para juecez
    - Lo mismo para ejercicios
- Formularios de contacto pra
    - own de perro
    - contacto general en menú contextual de usuario
    - localizacion mal
    - peticion de ser organizador
- Devolver si es organizador en endpoint de usuario
- Mostrar jueces y competiciones si eres organizador
- Añadir checkbox de owned habilitado por defecto en creación de perros
- Endpoint de enroll solo tiene que devolver los perros owned
- En el stage publico mostrar el organizador
- Ordenar stages por fechas
- Añadir estilo disabled al botón del mapa
- Añadir justificación de porque se cobra al añadir perros a una competición, por mensualidad de heroku, postgres...
- En caso de intentar dar de alta un perro que exista, mostrar diálogo con formulario para hacer el own del perro
- Mostrar algún icono o algo cuando se esté offline, igual un olerlas ligero
- Para mapa:
    - ~~openstreetmap + leaflet~~
    - Search - Nominatim Manual https://share.google/UqKWMxkAICjfdBM5t para recuperar coordenadas a partir de direccion
- ~~El endpoint que devuelve la lista de competidores con todos los scores tiene que traer de alguna forma una
  configuración para las puntuaciones, máximas, mínimas, o valores válidos o valores no válidos...~~
- ~~Cuando se entra directamente en offline, no funciona app~~
- ~~En my scores el endpoint debe devolver nombre de competi, nombre se stage, nombre de evento, id evento, nombres de
  juez, ids de juez y un estado~~
    - ~~Hacer vista de colecta de scores con filtrado por url, así el colector solo ve 1 juez, pero el creador de la
      competi al no pasar por URL el id de juez, puede ver todos y modificarlos todos~~
    - ~~que la vista tenga un select con un prelabel para identificar si se a terminado la colecta, este select se
      controla con parametro de url~~
    - ~~una tabla donde primera columna será el ejercicio~~
    - ~~columnas de jueces en base a parametros de url~~
- ~~Que los guias se puedan apuntar a eventos desde stages~~

# Funcionalidades premium

- Al estar loged, offline
- Filtros avanzados en busquedas
- funcionalidad own a dog
