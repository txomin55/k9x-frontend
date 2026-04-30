# NOTAS

- 4 tipos de usuario
    - visitante
        - puede ver stages y eventos
    - competidor
        - puede hacer enroll en evento
    - organizador
        - puede crear jueces
        - puede crear competiciones
        - puede elegir si owns a dog
    - admin

# PENDIENTES FUTUROS

- Crear my rankings. Donde puedes hacer sumas de eventos seleccionados. Y hacer análisis propios y poder compartirlos
- Postgresql https://supabase.com/dashboard/org/jdtxnyedrfjutiaadkwi
- Añadir justificación de porque se cobra al añadir perros a una competición, por mensualidad de heroku, postgres...

### MVP

- ~~Estilos tooltip mapa en oscuro~~
- Añadir boton ghost que reemplaza enroll por "login for enroll"
- Ver como simplificar el modelo oas
- Estado inicial de competicion será draft, añadir boton de ready para enviar notificaciones a colectores en cada cambio
- Permitir en clasificación publica modo tabla o modo resumen
- Modificar URLs de colección para que cuelgue de events/id/collection
    - Lo mismo para la clasificación
- Collection max width a la row de score y empezar columnas de derecha a izquierda
- reemplazar /api por /secured
- meter newrelic
- Crear combobox para poder reemplazar los select de perros
    - Lo mismo paea participantes
    - Lo mismo para juecez
    - Lo mismo para ejercicios
- Formularios de contacto para
    - own de perro
    - ~~contacto general en menú contextual de usuario~~
    - ~~localizacion mal~~
    - ~~peticion de ser organizador~~
    - cerrar formularios y poner un success
- ~~Añadir checkbox de owned deshabilitado por defecto en creación de perros para organizador~~
- Endpoint de enroll solo tiene que devolver los perros owned
- enroll no aparece cuando event ha empezado o terminado
- classification no aparece cuando event es pending
- En el stage publico mostrar el organizador
- En caso de intentar dar de alta un perro que exista, mostrar diálogo con formulario para hacer el own del perro
- añadir boton de crear perros para competidor en caso de no tener ninguno
    - ocultar check de owned y tenerlo a true
- hacer que la app a 720 cambie de lista de cards a modo tabla
- Para mapa:
    - ~~openstreetmap + leaflet~~
    - Search - Nominatim Manual https://share.google/UqKWMxkAICjfdBM5t para recuperar coordenadas a partir de direccion
- ~~Mock de markers con estados diferentes~~
- ~~Mostrar jueces y competiciones si eres organizador~~
- ~~Devolver si es organizador en endpoint de usuario~~
- ~~Brwadcrumbs en clasificación e info~~
- ~~Offline retry con sw~~
- ~~Mostrar algún icono o algo cuando se esté offline, igual un olerlas ligero~~
- ~~Ordenar stages por fechas~~
- ~~Añadir estilo disabled al botón del mapa~~
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

#### UNA VEZ ESTÉ EL BACKEND

- Hacer campos obligatorios para edición y creación
- Terminar push manager
- Cuando se usa en get, hacer wrap de elemento con id y name + nombre identificador. Cuando se usa en post o put, usar
  dogid o eventid a secas. Hay que modificar contratos

# Funcionalidades premium

- Al estar loged, offline
- Filtros avanzados en busquedas
- funcionalidad own a dog
