# Pendientes

- Para mapa:
    - openstreetmap + leaflet
    - Search - Nominatim Manual https://share.google/UqKWMxkAICjfdBM5t para recuperar coordenadas a partir de direccion
- Que los guias se puedan apuntar a eventos desde stages
- Crear my rankings. Donde puedes hacer sumas de eventos seleccionados. Y hacer análisis propios y poder compartirlos
- ~~En my scores el endpoint debe devolver nombre de competi, nombre se stage, nombre de evento, id evento, nombres de
  juez, ids de juez y un estado~~
    - Hacer vista de colecta de scores con filtrado por url, así el colector solo ve 1 juez, pero el creador de la
      competi al no pasar por URL el id de juez, puede ver todos y modificarlos todos
    - que la vista tenga un select con un prelabel para identificar si se a terminado la colecta, este select se
      controla con parametro de url
    - una tabla donde primera columna será el ejercicio
    - columnas de jueces en base a parametros de url
- Offline retry con sw
- Terminar push manager
- https://supabase.com/dashboard/org/jdtxnyedrfjutiaadkwi
- Estado inicial de competicion será draft, añadir boton de ready para enviar notificaciones a colectores en cada cambio
- ~~Cuando se entra directamente en offline, no funciona app~~

# Funcionalidades premium

- Al estar loged, offline
- Filtros avanzados en busquedas