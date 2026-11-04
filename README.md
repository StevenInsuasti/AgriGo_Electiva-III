# AgriGo

AgriGo es una aplicación frontend de demostración de un mercado agrícola digital. Su propósito es aplicar las temáticas de Angular y TypeScript vistas en Electiva III mediante un recorrido sencillo: un productor publica productos locales y un comprador puede encontrarlos, agregarlos al carrito y completar un pedido simulado.

AgriGo es un proyecto académico. No procesa pagos, no coordina despachos y no sincroniza información entre dispositivos.

## Objetivo del proyecto

Construir una experiencia clara y funcional que permita demostrar los conceptos de desarrollo frontend trabajados en clase, sin convertir el proyecto en una plataforma comercial ni agregar servicios innecesarios.

## Usuarios y funcionalidades

### Comprador

- Explorar los productos de demostración y los productos publicados localmente.
- Buscar por nombre del producto o del productor.
- Filtrar el catálogo por categoría.
- Consultar el detalle de un producto.
- Agregar productos al carrito.
- Ajustar cantidades sin superar el inventario disponible y quitar productos.
- Completar un checkout de demostración con datos de entrega validados y una preferencia de pago simulada.
- Ver la confirmación del pedido y consultar el historial de pedidos.

### Productor

- Consultar sus publicaciones.
- Crear productos indicando nombre, descripción, categoría, precio en pesos colombianos, unidad, cantidad disponible, productor, ubicación e imagen.
- Editar los datos de sus productos.
- Cambiar sus datos de productor.
- Eliminar publicaciones.

## Recorrido principal de demostración

```text
Productor publica un producto
        -> producto guardado en el navegador
        -> producto aparece en el Marketplace
        -> comprador busca o filtra
        -> consulta el detalle y agrega al carrito
        -> completa el checkout simulado
        -> pedido guardado y carrito vaciado
        -> comprador revisa confirmación e historial
```

La interfaz debe indicar de forma visible que los datos son locales y que no se realizan cobros ni despachos.

## Alcance técnico

- Aplicación frontend construida con Angular y TypeScript.
- Componentes standalone con `@Component`.
- Comunicación entre componentes mediante `@Input`, `@Output` y `EventEmitter`.
- Interpolación, property binding, attribute binding y event binding.
- Directivas `*ngFor` y `*ngIf`, y clases dinámicas con `ngClass`.
- Estado de interfaz con Signals (`signal`, `.set()` y `.update()`).
- Interfaces y tipos de TypeScript para productos, carrito y pedidos.
- Formularios reactivos con `FormControl`, `FormBuilder` y validadores.
- Rutas de Angular para conectar las pantallas del recorrido.
- Persistencia local en `localStorage`, incluyendo datos semilla para una primera ejecución.
- Estilos de pantalla con SCSS/CSS.

Se deben aplicar las temáticas de Angular y TypeScript demostradas en el proyecto de clase `book-angular-6b`. Ese proyecto de referencia y la carpeta de mockups son material de consulta local y no forman parte de este repositorio.

## Desarrollo local

La aplicación Angular está en `frontend/`. Requiere Node.js compatible con la versión de Angular del proyecto y npm.

```powershell
cd frontend
npm install
npm start
```

La aplicación se sirve en `http://localhost:4200/`. Para compilar y ejecutar las pruebas:

```powershell
npm run build
npm test -- --watch=false
```

### Estado compartido de productos

El contrato `Product` está en `frontend/src/app/models/product.model.ts`. `ProductStore`, en `frontend/src/app/services/product.store.ts`, es la fuente única de productos:

- Leer el catálogo: `productStore.products()` (Signal de solo lectura).
- Agregar: `productStore.addProduct(product)`.
- Editar: `productStore.updateProduct(product)`.
- Eliminar: `productStore.deleteProduct(productId)`.

El store inicializa `agrigo.products` en `localStorage` con los datos de `frontend/src/app/data/product-seed.ts` solo cuando aún no existe esa clave. Los cambios se guardan antes de actualizar el Signal. Los componentes que publiquen productos deben usar este store y no crear otra lista o clave de almacenamiento independiente. Si el valor guardado no es JSON válido o no cumple el modelo `Product`, el store informa el error en vez de reemplazarlo silenciosamente.

### Publicaciones del productor

La pantalla `frontend/src/app/producer-publications/` se abre en `/mis-publicaciones` y utiliza el `ProductStore` compartido para crear, editar y eliminar productos. En esta demostración, “Mis publicaciones” muestra los productos cuyo `producerName` es `Héctor Riascos`, incluido el producto semilla asignado a ese productor. El formulario mantiene ese nombre fijo porque el proyecto no implementa cuentas ni autenticación. Los campos del producto se validan antes de guardar y las acciones actualizan el mismo catálogo que consulta Marketplace.

### Marketplace y detalle

El Marketplace consulta `ProductStore`, permite buscar por nombre de producto o productor y filtrar por categoría. Cada tarjeta recibe un `Product` con `@Input` y emite el identificador seleccionado mediante `@Output`/`EventEmitter`. El detalle está disponible en `/producto/:id` y muestra los datos del mismo producto guardado en el store.

Los contratos iniciales `CartItem` y `PurchaseOrder` están en `frontend/src/app/models/`; las siguientes etapas pueden ampliarlos mediante sus propios PR si acuerdan cambios con el equipo.

## Datos y limitaciones

- Los productos iniciales son datos semilla de demostración.
- Los cambios se guardan en el `localStorage` del navegador actual.
- Los datos no se comparten ni sincronizan entre computadores o navegadores.
- No se implementan cuentas reales, backend comercial, base de datos, procesamiento de pagos, logística de entrega ni funcionalidades de IA.

## Organización del trabajo con Git

- `main` se reserva para la versión final revisada del proyecto.
- `develop` integra el trabajo de las funcionalidades.
- Cada funcionalidad se desarrolla en una rama creada desde `develop`, con un nombre como `feature/sebas/publicar-producto`.
- Los cambios se integran a `develop` mediante Pull Request.
- El equipo debe exigir dos aprobaciones antes de permitir el merge de un PR.
- Cuando `develop` esté listo para la entrega, se propondrá su integración a `main` mediante otro Pull Request.

El documento inicial del proyecto se puede usar como commit de arranque de `main`; después se crea `develop` desde ese commit para que ambas ramas comiencen con el mismo README. Esto no implica subir a `main` el código de las funcionalidades durante el desarrollo.
