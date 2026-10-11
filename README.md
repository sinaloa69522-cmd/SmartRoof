# SmartRoof

App web para contratistas de techos, inspirada en Roofr. Un solo archivo, sin servidor.

- `index.html`: ábrelo con doble clic en tu navegador (Chrome, Edge, Safari). Los datos se guardan en ese navegador.
- `artifact.html`: la misma app en el formato que se publica como Artifact en Claude.
- `src/`: código fuente (`app.js`, `styles.css`, `shell.html`). Ejecuta `python3 build.py` para regenerar los dos HTML.

## Funciones incluidas
- Medición de techos sobre plano en pies, sobre una imagen aérea calibrada, o sobre mapa satelital (Esri; requiere abrir `index.html` fuera de la vista previa).
- Facetas con pendiente, líneas (alero, hastial, cumbrera, limatesa, limahoya, tapajuntas), clasificación automática de aristas.
- Informe de medición con diagrama, longitudes ajustadas por pendiente, tabla de desperdicio y materiales.
- Propuestas Bueno/Mejor/Excelente desde la medición y el catálogo, con márgenes; vista de cliente con firma electrónica.
- CRM con tablero por etapas (arrastrar y soltar), actividad y siguientes pasos.
- Facturas con depósito, pagos parciales y saldo; pedidos de material copiables para el proveedor.
- Estimador instantáneo que convierte solicitudes en prospectos. Catálogo de precios editable. Respaldo por copiar/pegar.
