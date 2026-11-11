# Sprint 2 – Explicación

## Back

### ¿Cómo sabe el back quién hace cada acción?
Todavía no tenemos JWT (llega en el Sprint 3), así que el front manda el `usuarioId` del usuario logueado en cada petición. En el Sprint 3 esto se reemplaza por el usuario que viene dentro del token. Es la misma idea que usan los profes en `favoritos`, donde cada favorito guarda el `user_id`.

### publicaciones/publicacion.schema.ts
- `@Schema({ collection: 'publicaciones', timestamps: true })`: `timestamps` agrega `createdAt` y `updatedAt` solos. Uso `createdAt` como la fecha de la publicación y para ordenar.
- `usuarioId`: el id del usuario que la creó. Así la publicación queda "relacionada a un usuario", como pide la consigna.
- `titulo` y `mensaje` son obligatorios. `imagenUrl` arranca vacío porque la imagen es opcional.
- `meGusta`: un array con los ids de los usuarios que dieron me gusta. Me sirve para saber si un usuario ya dio me gusta y no dejar que lo dé dos veces.
- `cantidadMeGusta`: la cantidad de me gusta guardada como número, para poder ordenar por me gusta directamente en Mongo.
- `eliminada`: para la **baja lógica**. Cuando se elimina una publicación no la borro de la base, le pongo `eliminada: true` y deja de aparecer en el listado.

### publicaciones/publicacion.dto.ts
- `UsuarioIdDto`: valida que el `usuarioId` sea un id de Mongo válido (`@IsMongoId`, como en `favorito.dto.ts` de los profes). Lo reuso en el alta, la baja y los me gusta.
- `CrearPublicacionDto`: título (máx. 100) y mensaje (máx. 1000), obligatorios. Extiende de `UsuarioIdDto`, igual que `CrearFavoritoDto extends NotaDto`.
- `ListarPublicacionesDto`: los parámetros del GET, todos opcionales:
  - `orden`: solo puede ser `fecha` o `meGusta` (`@IsIn`).
  - `usuarioId`: para filtrar las publicaciones de un usuario.
  - `offset` y `limit`: para paginar. Por la URL llegan como texto, así que los paso a número con `@Transform`, como hacen los profes con los números en la clase 11. `limit` va de 1 a 50 para que nadie pida miles de publicaciones de golpe.

### publicaciones/publicaciones.service.ts
- **crear**: primero verifico que el usuario exista (si no, 404). Si vino una imagen, la valido y la subo a Cloudinary con el mismo `CloudinaryService` del registro, pero en la carpeta `publicaciones`. Después guardo la publicación.
- **listar**:
  - Solo traigo las que tienen `eliminada: false`. Si viene `usuarioId`, filtro también por usuario.
  - Orden: por defecto `createdAt: -1` (las más nuevas primero). Si piden `meGusta`, ordeno por `cantidadMeGusta: -1`, y si empatan, por fecha.
  - Paginación con `.skip(offset).limit(limit)`. Por defecto `offset` 0 y `limit` 10.
  - Con `countDocuments` saco el **total**, que el front necesita para saber cuántas páginas hay.
- **eliminar**: busco la publicación y el usuario. Si no es el autor y tampoco es administrador, respondo **403 Forbidden**. Si puede, pongo `eliminada = true` y guardo (baja lógica).
- **darMeGusta**: si el usuario ya está en el array `meGusta`, respondo **409 Conflict** ("Ya le diste me gusta"). Si no, lo agrego y actualizo `cantidadMeGusta`.
- **quitarMeGusta**: si el usuario no estaba en el array, respondo **404** ("No le habías dado me gusta"), porque la consigna dice que solo se puede quitar si antes lo había dado. Si estaba, lo saco con `filter` y actualizo la cantidad.
- **buscar** (privado): valida el id con `isObjectIdOrHexString` (como en `favoritos.service.ts`) y devuelve 404 si no existe o si ya estaba eliminada.
- **armarRespuesta** (privado): junta cada publicación con los datos de su autor (nombre de usuario y foto). Busco todos los autores de una sola vez con `buscarPorIds` y los guardo en un `Map` por id, igual que los profes juntan favoritos con libros. Así el front puede mostrar quién publicó cada cosa.

### publicaciones/publicaciones.controller.ts
| Ruta | Qué hace | Status |
|---|---|---|
| `POST /publicaciones` | Crea una publicación (multipart, imagen opcional en el campo `imagen`) | 201 |
| `GET /publicaciones?orden=&usuarioId=&offset=&limit=` | Lista con orden, filtro y paginación | 200 |
| `DELETE /publicaciones/:id?usuarioId=` | Baja lógica (autor o admin) | 204 / 403 / 404 |
| `POST /publicaciones/:id/me-gusta` | Da me gusta (body: `usuarioId`) | 201 / 409 |
| `DELETE /publicaciones/:id/me-gusta?usuarioId=` | Quita el me gusta | 200 / 404 |

- La baja devuelve **204 No Content** con `@HttpCode(204)`, porque no hay nada para devolver (igual que el `@Delete` de favoritos).
- El límite de la imagen es de 4 MB porque Vercel no acepta peticiones más grandes que eso.

### publicaciones/publicaciones.module.ts
Importa `UsuariosModule` (para buscar usuarios), registra el schema `Publicacion` con `forFeature` y agrega `CloudinaryService` a los providers.

### usuarios/usuarios.service.ts
Agregué dos métodos:
- `buscarPorId`: devuelve `null` si el id no es válido o no existe.
- `buscarPorIds`: trae varios usuarios a la vez con `$in`.

### cloudinary/cloudinary.service.ts y auth/auth.service.ts
`subir` ahora recibe la **carpeta** (`perfiles` o `publicaciones`), así en Cloudinary quedan separadas las fotos de perfil de las imágenes de las publicaciones.

---

## Front

### core/models/publicacion.interface.ts
La forma de una publicación como la devuelve el back, y `PaginaPublicaciones`, que es la respuesta del listado (las publicaciones + el total).

### core/services/publicaciones.service.ts
Un método por cada ruta del back. Para los parámetros de la URL uso `HttpParams` (clase 4). Por ejemplo, `listar` arma `?orden=fecha&offset=0&limit=5`.

### core/services/auth.service.ts
Ahora, además de guardar el usuario en el signal, lo guardo en `localStorage`. Así, si recargo la página, sigo logueada. Al cerrar sesión lo borro.

### shared/components/publicacion-card (el componente de cada publicación)
La consigna pide que cada publicación sea un componente, así que hice `PublicacionCard`:
- Recibe la publicación del padre con `@Input()`, y también el id del usuario logueado para saber si ya le dio me gusta y si es suya.
- No llama al back: le avisa al padre con `@Output()` cuando tocan "me gusta" o "eliminar", y el padre hace la petición (comunicación padre-hijo de la clase).
- El botón de me gusta se pinta (♥) si ya le di me gusta, y si no aparece vacío (♡).
- El botón "Eliminar" solo aparece en mis propias publicaciones.

### shared/components/modal
Le agregué la opción de mostrar un botón "Cancelar" (`mostrarCancelar`) y de cambiar el texto del botón principal. Lo uso para confirmar antes de eliminar, en vez de `confirm()`, que la consigna no permite.

### features/publicaciones
- **Formulario de nueva publicación**: título y mensaje con validaciones, e imagen opcional. Lo mando como `FormData`, igual que el registro. Después de publicar, recargo la lista desde la primera página.
- **Orden**: un `select` con "Más recientes" o "Más me gusta". Al cambiarlo vuelvo a la página 1 y recargo.
- **Paginación**: traigo 5 por página. El `offset` lo calculo como `(página - 1) * 5`, y con el `total` que devuelve el back calculo cuántas páginas hay. Los botones Anterior/Siguiente se deshabilitan en la primera y en la última página.
- **Me gusta**: si ya le había dado, llamo a quitar; si no, a dar. El back devuelve la publicación actualizada y la reemplazo en la lista con `update`, así no recargo todo.
- **Eliminar**: abre el modal de confirmación. Si confirmo, la elimino y recargo la página. Si era la última publicación de la página, vuelvo a la anterior.
- Los errores del back se muestran en el modal de error.

### features/mi-perfil
- Muestra todos mis datos y mi foto, como antes.
- Además pido mis **últimas 3 publicaciones** al back (`usuarioId` = mi id, `limit` = 3, orden por fecha) y las muestro con el mismo componente `PublicacionCard`.
- Debajo de cada una hay un espacio para los comentarios. Los comentarios se crean recién en el Sprint 3, así que por ahora dice "Todavía no hay comentarios".
