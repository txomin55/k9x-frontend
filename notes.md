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

- En collections el combo de selección de competidor la R cerda reemplazar
- dorsal de competidor reusado como position?
- reemplazar boton de eliminar de competidor por "no presentado" cuando el estado sea empezado que haga la actualizacion
  del estado de not_competing
  en backend
    - añador boton en collections tambien
    - ocultar botones de eliminar o no presentado cuando el evento ya a terminado
    - ocultar boton si el competidor ya esta no presentado y hacerlo visible
- endpoint para saber si se puede eliminar perro
- endpoint para saber si se puede eliminar juez

#### UNA VEZ ESTÉ EL BACKEND

- meter newrelic
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
