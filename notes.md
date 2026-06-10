# NOTAS

- 4 tipos de usuario
    - visitante
        - puede ver stages y eventos
    - competidor
        - puede hacer enroll en evento
    - organizador
        - puede crear jueces
        - puede crear competiciones
            - aceptar enroll
        - puede elegir si owns a dog
    - admin

# PENDIENTES FUTUROS

- Crear my rankings. Donde puedes hacer sumas de eventos seleccionados. Y hacer análisis propios y poder compartirlos
- Añadir justificación de porque se cobra al añadir perros a una competición, por mensualidad de heroku, postgres...
- hacer que la app a 720 cambie de lista de cards a modo tabla
- puedo hacer que el usuario no logueado tenga un renderizado mas rapido con otro layout que no cargue todo? google
  performance

### MVP

- Boton aceptar perro en evento
- mirar card de mapa
- refinar vista de clasificacion
- accion para si el competidor compite o no en collections de datos o evento mismo de stage en competitions
- dorsal de competidor reusado como position?
- Acciones de eliminar por estado
- limpiar un poco todo visualmente en general
- ~~cerrar formularios y poner un success~~
- ~~Ver como simplificar el modelo oas~~
    - ~~Cuando se usa en get, hacer wrap de elemento con id y name + nombre identificador. Cuando se usa en post o put,
      usar~~
- ~~Borrar endpoints fuera de mvp, (perros publicos)~~
- ~~Endpoint de hacer enroll solo tiene que devolver los perros owned~~
- ~~Modificar URLs de colección para que cuelgue de events/id/classification~~
- ~~añadir boton de crear perros para competidor en caso de no tener ninguno~~
- ~~ocultar check de owned y tenerlo a true para competidor~~
- ~~Crear combobox para poder reemplazar los select de perros~~
    - ~~Lo mismo paea participantes~~
    - ~~Lo mismo para juecez~~
    - ~~Lo mismo para ejercicios~~
- ~~Modificar URLs de colección para que cuelgue de events/id/collection~~
- ~~reemplazar /api por /secured~~
- ~~En el stage publico mostrar el organizador~~
- ~~openstreetmap + leaflet~~
- ~~Añadir boton ghost que reemplaza enroll por "login for enroll"~~
- ~~Estilos tooltip mapa en oscuro~~
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
- ~~contacto general en menú contextual de usuario~~
- ~~localizacion mal~~
- ~~peticion de ser organizador~~
- ~~Añadir checkbox de owned deshabilitado por defecto en creación de perros para organizador~~

#### UNA VEZ ESTÉ EL BACKEND

- meter newrelic
- ~~enroll no aparece cuando event ha empezado o terminado~~
- ~~classification no aparece cuando event es pending~~
- ~~Hacer campos obligatorios para edición y creación~~
- Terminar push manager
- Formularios de contacto para
    - own de perro
        - En caso de intentar dar de alta un perro que exista, mostrar diálogo con formulario para hacer el own del
          perro
- Profiling con mcp de Chrome para ver comportamiento de la cache

# Funcionalidades premium

- Al estar loged, offline
- Filtros avanzados en busquedas (PENDIENTE)
- funcionalidad own a dog
