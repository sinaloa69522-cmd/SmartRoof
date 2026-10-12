/* SmartRoof: traducción al inglés. La app se escribe en español y, con el idioma en inglés,
   cada texto que aparece en pantalla se traduce con este diccionario y los patrones de abajo. */
'use strict';
const EN = {
  // navegación y general
  'Panel': 'Dashboard', 'Trabajos': 'Jobs', 'Estimador web': 'Web estimator', 'Catálogo de precios': 'Price catalog', 'Ajustes': 'Settings',
  'Nuevo trabajo': 'New job', 'Instalar app': 'Install app', 'Principal': 'Main', '← Trabajos': '← Jobs', 'ejemplo': 'example',
  '¿Seguro? Toca otra vez': 'Sure? Tap again', 'Cancelar': 'Cancel', 'Agregar': 'Add', 'Quitar': 'Remove', 'Ir': 'Go', 'Entendido': 'Got it',
  'Datos de ejemplo.': 'Sample data.', 'Los trabajos marcados como «ejemplo» sirven para explorar la app. Puedes borrarlos cuando quieras.': 'Jobs marked «example» are there to help you explore the app. You can delete them anytime.',
  'Borrar ejemplos': 'Delete examples', 'Ocultar aviso': 'Hide notice', 'Idioma': 'Language',
  // panel
  'Embudo abierto': 'Open pipeline', 'Ventas ganadas': 'Won sales', 'Por cobrar': 'Receivable', 'Tasa de cierre': 'Close rate', 'saldo de facturas': 'invoice balances',
  'Valor por etapa': 'Value by stage', 'Ver tablero': 'View board', 'Siguientes pasos': 'Next steps', 'Todo al día.': 'All caught up.', 'Actividad reciente': 'Recent activity', 'Sin actividad todavía.': 'No activity yet.',
  'Medir el techo': 'Measure the roof', 'Preparar propuesta': 'Prepare proposal', 'Enviar propuesta': 'Send proposal', 'Crear factura de depósito': 'Create deposit invoice', 'Pedir materiales': 'Order materials',
  // etapas
  'Nuevo prospecto': 'New lead', 'Inspección': 'Inspection', 'Propuesta enviada': 'Proposal sent', 'Aprobado': 'Approved', 'En producción': 'In production', 'Facturado': 'Invoiced', 'Pagado': 'Paid', 'Perdido': 'Lost',
  // tablero
  'Arrastra una tarjeta para cambiarla de etapa.': 'Drag a card to change its stage.', 'Buscar cliente o dirección': 'Search customer or address', 'Sin dirección': 'No address', 'Firmada': 'Signed',
  // trabajo
  'Etapa': 'Stage', 'Valor': 'Value', 'Resumen': 'Summary', 'Medición': 'Measurement', 'Informe': 'Report', 'Propuesta': 'Proposal', 'Factura': 'Invoice', 'Pedido de material': 'Material order',
  'Medir': 'Measure', 'Proponer': 'Propose', 'Firmar': 'Sign', 'Facturar': 'Invoice', 'Cobrar': 'Collect', 'Dibuja el techo': 'Draw the roof', 'Borrador': 'Draft', 'Enviada': 'Sent', 'Genera opciones': 'Build options',
  'Firma del cliente': 'Customer signature', 'Crea la factura': 'Create the invoice', 'Cliente': 'Customer', 'Nombre': 'Name', 'Origen': 'Source', 'Teléfono': 'Phone', 'Correo': 'Email',
  'Dirección de la propiedad': 'Property address', 'Notas': 'Notes', 'Eliminar trabajo': 'Delete job', 'Actividad': 'Activity', 'Agregar nota o llamada': 'Add a note or call', 'Sin actividad.': 'No activity.',
  'Referido': 'Referral', 'Estimador web ': 'Web estimator', 'Puerta a puerta': 'Door to door', 'Aseguradora': 'Insurance', 'Otro': 'Other',
  // medición
  'Fuente del dibujo': 'Drawing source', 'Plano': 'Grid', 'Imagen': 'Image', 'Satélite': 'Satellite', 'Cuadrícula en pies. Dibuja con las medidas de la inspección.': 'Grid in feet. Draw using your inspection measurements.',
  'Subir foto aérea o captura': 'Upload aerial photo or screenshot', 'Sube una captura satelital (Google Maps, Nearmap, EagleView) o foto de dron.': 'Upload a satellite screenshot (Google Maps, Nearmap, EagleView) or drone photo.',
  'Falta calibrar la escala: usa «Calibrar escala» sobre la barra de escala o una medida conocida.': 'Scale not calibrated: use «Calibrate scale» on the scale bar or a known length.',
  'Dirección o lat, lng': 'Address or lat, lng', 'Usar mi ubicación (en la obra)': 'Use my location (on site)', 'Imagen satelital': 'Satellite imagery', 'Realzar contraste y brillo': 'Boost contrast and brightness',
  'Si una imagen se ve borrosa o vieja, prueba otra fuente.': 'If an image looks blurry or old, try another source.', 'Esri (recomendada)': 'Esri (recommended)', 'Google (requiere llave)': 'Google (key required)',
  'Ver Street View': 'View Street View', 'Herramienta': 'Tool', 'Seleccionar': 'Select', 'Faceta': 'Facet', 'Línea': 'Line', 'Calibrar escala': 'Calibrate scale', 'Distancia real': 'Real distance', 'Aplicar': 'Apply',
  'Deshacer': 'Undo', 'Líneas desde facetas': 'Lines from facets', 'Cerrar faceta': 'Close facet', 'Pendiente': 'Pitch', 'Aplicar a todas': 'Apply to all', 'Eliminar faceta': 'Delete facet',
  'Línea seleccionada': 'Selected line', 'Eliminar línea': 'Delete line', 'Pendiente nueva': 'New facet pitch', 'Penetraciones': 'Penetrations', 'Desperdicio': 'Waste',
  'Área total del techo': 'Total roof area', 'Cuadros (sq)': 'Squares (sq)', 'Pendiente predominante': 'Predominant pitch', 'Facetas': 'Facets', 'Ver informe': 'View report', 'Propuesta →': 'Proposal →', 'Borrar dibujo': 'Clear drawing',
  'Alero': 'Eave', 'Hastial': 'Rake', 'Cumbrera': 'Ridge', 'Limatesa': 'Hip', 'Limahoya': 'Valley', 'Tapajuntas': 'Flashing', 'Tapaj. escalonado': 'Step flashing',
  'Listo': 'Ready', 'Toca una faceta o línea para editarla': 'Tap a facet or line to edit it', 'Haz clic en cada esquina de la faceta': 'Click each corner of the facet',
  'Clic para terminar la línea · Esc para soltar': 'Click to finish the line · Esc to release', 'Marca dos puntos de una distancia conocida': 'Mark two points of a known distance',
  'Calibra la escala para ver medidas': 'Calibrate the scale to see measurements', 'Faceta cerrada. Dibuja la siguiente o usa «Líneas desde facetas».': 'Facet closed. Draw the next one or use «Lines from facets».',
  'Buscando la propiedad…': 'Finding the property…', 'Obteniendo tu ubicación…': 'Getting your location…',
  'Las imágenes satelitales no cargan aquí.': 'Satellite images don\'t load here.', 'Revisa tu conexión, o': 'Check your connection, or', 'cambia a': 'switch to', 'Revisa tu conexión, o cambia a': 'Check your connection, or switch to',
  'y sube una captura satelital del techo (con su barra de escala) para medir sobre ella.': 'and upload a satellite screenshot of the roof (with its scale bar) to measure on it.',
  'Esta vista previa bloquea mapas externos. Abre el archivo': 'This preview blocks external maps. Open the file', 'directamente en tu navegador para usar el satélite, o': 'directly in your browser to use satellite, or',
  'Street View': 'Street View', 'Abrir en Google Maps': 'Open in Google Maps', 'Cerrar': 'Close',
  'Arrastra para girar la vista. Si aparece un error, activa «Maps Embed API» en tu proyecto de Google Cloud.': 'Drag to rotate the view. If you see an error, enable «Maps Embed API» in your Google Cloud project.',
  'Para verlo aquí, agrega tu llave de Google en Ajustes. Mientras, usa «Abrir en Google Maps».': 'To see it here, add your Google key in Settings. Meanwhile, use «Open in Google Maps».',
  'Street View no se puede mostrar en esta vista previa. Mientras, usa «Abrir en Google Maps».': 'Street View can\'t be shown in this preview. Meanwhile, use «Open in Google Maps».',
  // informe
  'Todavía no hay medición.': 'No measurement yet.', 'Dibuja las facetas del techo para generar el informe.': 'Draw the roof facets to generate the report.', 'Ir a Medición': 'Go to Measurement',
  'Imprimir / PDF': 'Print / PDF', 'Editar medición': 'Edit measurement', 'Crear propuesta →': 'Create proposal →', 'Informe de medición': 'Measurement report',
  'Área total': 'Total area', 'Cuadros': 'Squares', '1 sq = 100 ft²': '1 sq = 100 ft²', 'Longitudes': 'Lengths', 'Tipo': 'Type', 'Pies': 'Feet', 'Metros': 'Meters',
  'Aleros + hastiales (gotero)': 'Eaves + rakes (drip edge)', 'Cumbreras + limatesas (caballete)': 'Ridges + hips (ridge cap)', 'Hastiales y limatesas/limahoyas ajustados por pendiente.': 'Rakes and hips/valleys adjusted for pitch.',
  'Planta ft²': 'Plan ft²', 'Real ft²': 'Actual ft²', 'Total': 'Total', 'Tabla de desperdicio': 'Waste table', 'Área ft²': 'Area ft²', 'Material': 'Material', 'Cantidad': 'Quantity', 'Base del cálculo': 'Calculation basis',
  'Teja (paquetes)': 'Shingles (bundles)', 'Membrana sintética (rollos)': 'Synthetic underlayment (rolls)', 'Hielo y agua (rollos)': 'Ice & water (rolls)', 'Teja de arranque (paquetes)': 'Starter (bundles)',
  'Caballete (paquetes)': 'Ridge cap (bundles)', 'Gotero (piezas de 10 ft)': 'Drip edge (10 ft pieces)', 'Ventila de cumbrera (piezas)': 'Ridge vent (pieces)', 'Clavos (cajas)': 'Nails (boxes)', 'Botas para tubería': 'Pipe boots',
  'Sin dibujo todavía.': 'No drawing yet.', 'Falta calibrar la escala de la imagen.': 'The image scale is not calibrated.', 'Diagrama del techo': 'Roof diagram',
  // fórmulas
  'Paquetes de teja (3 por cuadro + desperdicio)': 'Shingle bundles (3 per square + waste)', 'Cuadros con desperdicio': 'Squares with waste', 'Cuadros medidos (sin desperdicio)': 'Measured squares (no waste)',
  'Rollos de membrana (10 cuadros c/u)': 'Underlayment rolls (10 squares each)', 'Rollos hielo y agua (aleros + limahoyas ÷ 66 ft)': 'Ice & water rolls (eaves + valleys ÷ 66 ft)',
  'Arranque (aleros + hastiales ÷ 105 ft)': 'Starter (eaves + rakes ÷ 105 ft)', 'Caballete (cumbreras + limatesas ÷ 33 ft)': 'Ridge cap (ridges + hips ÷ 33 ft)', 'Gotero (aleros + hastiales ÷ 10 ft)': 'Drip edge (eaves + rakes ÷ 10 ft)',
  'Ventila de cumbrera (cumbreras ÷ 4 ft)': 'Ridge vent (ridges ÷ 4 ft)', 'Cajas de clavos (1 por 20 cuadros)': 'Nail boxes (1 per 20 squares)', 'Tapajuntas (lineales ÷ 10 ft)': 'Flashing (linear ÷ 10 ft)',
  'Penetraciones (tubos/ventilas)': 'Penetrations (pipes/vents)', 'Cantidad fija: 1': 'Fixed quantity: 1', 'Manual': 'Manual',
  // catálogo
  'Teja asfáltica 3-tab': '3-tab asphalt shingles', 'Teja arquitectónica (laminada)': 'Architectural shingles (laminated)', 'Teja premium de diseñador': 'Premium designer shingles', 'Membrana sintética': 'Synthetic underlayment',
  'Barrera de hielo y agua': 'Ice & water shield', 'Teja de arranque': 'Starter strip', 'Teja de caballete': 'Ridge cap shingles', 'Gotero metálico 10 ft': 'Metal drip edge 10 ft', 'Ventila de cumbrera 4 ft': 'Ridge vent 4 ft',
  'Clavos en bobina': 'Coil roofing nails', 'Bota para tubería': 'Pipe boot', 'Tapajuntas metálico 10 ft': 'Metal flashing 10 ft', 'Retiro de techo existente': 'Tear-off of existing roof', 'Mano de obra de instalación': 'Installation labor',
  'Contenedor y limpieza': 'Dumpster and cleanup', 'Permiso municipal': 'Building permit', 'Partida adicional': 'Additional item', 'Producto nuevo': 'New product',
  'paq': 'bdl', 'rollo': 'roll', 'pza': 'pc', 'caja': 'box', 'cuadro': 'sq', 'serv': 'svc', 'hoja': 'sheet',
  'Cada producto calcula su cantidad a partir de la medición. Cambia aquí precios y costos.': 'Each product calculates its quantity from the measurement. Change prices and costs here.',
  'Agregar producto': 'Add product', 'Producto': 'Product', 'Unidad': 'Unit', 'Cantidad según': 'Quantity based on', 'Costo': 'Cost', 'Precio': 'Price', 'Margen': 'Margin', 'Eliminar producto': 'Delete product', 'Mano de obra': 'Labor',
  // propuesta
  'Genera la propuesta en un clic.': 'Generate the proposal in one click.', 'Usaremos la medición y tu catálogo de precios para armar tres opciones: Bueno, Mejor y Excelente.': 'We\'ll use the measurement and your price catalog to build three options: Good, Better and Best.',
  'Primero mide el techo, o crea la propuesta vacía y agrega partidas a mano.': 'Measure the roof first, or create an empty proposal and add items by hand.', 'Generar propuesta': 'Generate proposal',
  'Bueno': 'Good', 'Mejor': 'Better', 'Excelente': 'Best', 'Teja 3-tab, garantía de 25 años': '3-tab shingles, 25-year warranty', 'Teja arquitectónica, garantía de 30 años y ventilación': 'Architectural shingles, 30-year warranty and ventilation',
  'Teja premium de diseñador, garantía de por vida': 'Premium designer shingles, lifetime warranty', 'Enviada · esperando firma': 'Sent · awaiting signature',
  'Recalcular desde medición': 'Recalculate from measurement', 'Vista del cliente': 'Customer view', 'Marcar como enviada': 'Mark as sent', 'Ir a factura →': 'Go to invoice →',
  'La propuesta está firmada. Para cambiar partidas, hazlo en la factura.': 'The proposal is signed. To change line items, do it on the invoice.', 'Agregar opción': 'Add option', 'Quitar opción': 'Remove option',
  'Nombre de la opción': 'Option name', 'Descripción': 'Description', 'Partida': 'Item', 'Cant.': 'Qty', 'Importe': 'Amount', 'Quitar partida': 'Remove item', 'Agregar del catálogo…': 'Add from catalog…', 'Partida libre': 'Custom item',
  'Subtotal': 'Subtotal', 'Descuento': 'Discount', 'Costo estimado / ganancia': 'Estimated cost / profit', 'Condiciones': 'Terms', 'Impuesto %': 'Tax %', 'Válida hasta': 'Valid until', 'Mensaje para el cliente': 'Message to the customer',
  'Términos': 'Terms', 'Eliminar propuesta': 'Delete proposal',
  'Gracias por la oportunidad de visitar su propiedad. Abajo encontrará las medidas de su techo y tres opciones de reemplazo. Elija la que prefiera y firme para aprobar.': 'Thank you for the opportunity to visit your property. Below you\'ll find your roof measurements and three replacement options. Choose the one you prefer and sign to approve.',
  'Se requiere un depósito del 30% para programar el trabajo. El saldo se paga al terminar. Garantía de mano de obra de 5 años. Cualquier reparación de madera dañada se cobra aparte a $95 por hoja de triplay.': 'A 30% deposit is required to schedule the job. The balance is due on completion. 5-year workmanship warranty. Any rotten decking repair is billed separately at $95 per plywood sheet.',
  // vista cliente
  '← Volver al editor': '← Back to editor', 'Así verá tu cliente la propuesta. Puede elegir opción y firmar aquí mismo, en tu tableta o teléfono.': 'This is how your customer sees the proposal. They can choose an option and sign right here on your tablet or phone.',
  'Propuesta de techo': 'Roofing proposal', 'Área del techo': 'Roof area', 'Aleros': 'Eaves', 'Cumbreras y limatesas': 'Ridges and hips', 'Elija su opción': 'Choose your option', 'Elegida': 'Chosen',
  'Aceptación': 'Acceptance', 'Al firmar, acepto la opción «': 'By signing, I accept the «', '» por': '» option for', 'y los términos de arriba.': 'and the terms above.', 'Área de firma': 'Signature area',
  'Nombre completo': 'Full name', 'Borrar firma': 'Clear signature', 'Aceptar y firmar': 'Accept and sign', '✓ Aprobada': '✓ Approved',
  // factura
  'Sin factura.': 'No invoice.', 'Primero crea una propuesta.': 'Create a proposal first.', 'Crear factura': 'Create invoice', 'Ir a propuesta': 'Go to proposal', 'Copiar resumen para enviar': 'Copy summary to send',
  'Emitida': 'Issued', 'Pago parcial': 'Partially paid', 'Pagada': 'Paid', 'Vencida': 'Overdue', 'Facturar a': 'Bill to', 'Concepto': 'Description', 'Agregar concepto (cambio de obra)': 'Add line (change order)', 'Saldo': 'Balance',
  'Registrar pago': 'Record payment', 'Monto': 'Amount', 'Fecha': 'Date', 'Método': 'Method', 'Pagos': 'Payments', 'Sin pagos todavía.': 'No payments yet.', 'Quitar pago': 'Remove payment', 'Fechas': 'Dates', 'Vence': 'Due', 'Eliminar factura': 'Delete invoice',
  'Tarjeta': 'Card', 'Transferencia': 'Bank transfer', 'Cheque': 'Check', 'Efectivo': 'Cash', 'Financiamiento': 'Financing', 'Cambio de obra: reemplazo de triplay': 'Change order: plywood replacement',
  // pedido
  'Sin pedido de material.': 'No material order.', 'Se arma con los materiales de la opción elegida y las cantidades de la medición.': 'It\'s built from the chosen option\'s materials and the measured quantities.', 'Generar pedido': 'Generate order',
  'Copiar pedido para el proveedor': 'Copy order for supplier', 'Agregar material': 'Add material', 'Entrega': 'Delivery', 'Proveedor': 'Supplier', 'Fecha de entrega': 'Delivery date', 'Estado': 'Status',
  'Dirección de entrega': 'Delivery address', 'Eliminar pedido': 'Delete order', 'Enviado': 'Sent', 'Confirmado': 'Confirmed', 'Entregado': 'Delivered', 'Entregar en la entrada. Llamar 30 min antes.': 'Deliver to the driveway. Call 30 min ahead.',
  // estimador
  'Tus clientes calculan un precio aproximado y te dejan sus datos. Cada solicitud entra como prospecto en el tablero.': 'Your customers get a ballpark price and leave their details. Every request lands on the board as a lead.',
  '¿Cuánto cuesta tu techo nuevo?': 'How much does your new roof cost?', 'Dirección': 'Address', 'Calle, ciudad': 'Street, city', 'Superficie de la casa (ft²)': 'Home size (ft²)',
  'Baja (hasta 4/12)': 'Low (up to 4/12)', 'Media (5–7/12)': 'Medium (5–7/12)', 'Pronunciada (8/12 o más)': 'Steep (8/12 or more)', 'Teja 3-tab': '3-tab shingles', 'Teja arquitectónica': 'Architectural shingles', 'Teja premium': 'Premium shingles', 'Lámina metálica': 'Metal roofing',
  'Precio estimado': 'Estimated price', 'Quiero mi inspección gratis': 'Get my free inspection', '¡Gracias! Te llamaremos pronto.': 'Thanks! We\'ll call you soon.', 'Probar otra vez': 'Try again',
  'Precio por cuadro instalado': 'Installed price per square', 'El rango del estimador usa estos valores. La superficie se ajusta por aleros (+12%) y por pendiente.': 'The estimator range uses these values. Area is adjusted for overhangs (+12%) and pitch.',
  'Mínimo': 'Minimum', 'Máximo': 'Maximum', 'Para ponerlo en tu sitio web hace falta la versión con servidor (ver «Siguiente fase» en Ajustes). Aquí puedes usarlo en persona o por teléfono.': 'Putting it on your website needs the server version (see «Next phase» in Settings). Here you can use it in person or over the phone.',
  // ajustes
  'Datos de tu empresa, impuestos y respaldo.': 'Your company details, taxes and backup.', 'Empresa': 'Company', 'Nombre comercial': 'Business name', 'Licencia': 'License', 'Moneda': 'Currency', 'Impuesto por defecto %': 'Default tax %',
  'Mensaje de propuesta por defecto': 'Default proposal message', 'Términos por defecto': 'Default terms', 'Logo de la empresa': 'Company logo', 'Sin logo todavía.': 'No logo yet.', 'Subir logo': 'Upload logo', 'Cambiar logo': 'Change logo',
  'PNG con fondo transparente se ve mejor.': 'A PNG with a transparent background looks best.', 'Mostrar como marca de agua en propuestas, facturas e informes': 'Show as a watermark on proposals, invoices and reports', 'Intensidad de la marca de agua:': 'Watermark strength:',
  'Llave de Google Maps (para el satélite de Google)': 'Google Maps key (for Google satellite)', 'Centro del mapa satelital (lat, lng)': 'Satellite map center (lat, lng)', 'Respaldo': 'Backup',
  'Los datos se guardan en este navegador. Copia un respaldo para pasarlos a otro equipo.': 'Data is saved in this browser. Copy a backup to move it to another device.', 'Copiar respaldo': 'Copy backup', 'Importar respaldo': 'Import backup',
  'Pega aquí el respaldo': 'Paste the backup here', 'Importar y reemplazar datos': 'Import and replace data', 'Borrar trabajos de ejemplo': 'Delete sample jobs', 'Restablecer todo': 'Reset everything',
  'Siguiente fase': 'Next phase', 'Funciones de la versión con servidor que esta versión todavía no incluye:': 'Server-version features this version doesn\'t include yet:',
  'Cuentas de usuario, equipo y datos en la nube compartidos entre dispositivos.': 'User accounts, team and cloud data shared across devices.', 'Medición automática por IA desde imagen satelital y compra de informes.': 'Automatic AI measurement from satellite imagery and report purchases.',
  'Envío de propuestas y facturas por correo/SMS con enlace de firma.': 'Sending proposals and invoices by email/SMS with a signing link.', 'Cobros en línea con tarjeta (Stripe) y financiamiento al cliente.': 'Online card payments (Stripe) and customer financing.',
  'Pedidos directos a proveedores (ABC Supply, SRS, Beacon) y calendario de cuadrillas.': 'Direct supplier ordering (ABC Supply, SRS, Beacon) and crew calendar.', 'Widget del estimador para insertar en tu sitio web.': 'Estimator widget to embed on your website.',
  // modales
  'Cliente ': 'Customer', 'Nombre del cliente': 'Customer name', 'Calle, ciudad, CP': 'Street, city, ZIP', 'Crear y medir': 'Create and measure',
  'Instalar SmartRoof': 'Install SmartRoof', 'Tendrás SmartRoof con su propio ícono, en pantalla completa y sin la barra del navegador.': 'You\'ll get SmartRoof with its own icon, full screen and without the browser bar.',
  'Abre esta página en': 'Open this page in', 'Toca el botón': 'Tap the', '(el cuadro con la flecha hacia arriba).': 'button (the square with the up arrow).', 'Compartir': 'Share', 'Elige': 'Choose', 'Agregar a pantalla de inicio': 'Add to Home Screen', 'y toca': 'and tap',
  'En': 'In', 'Chrome o Edge': 'Chrome or Edge', ', abre el menú': ', open the browser menu', 'del navegador.': '.', 'Toca': 'Tap', 'Instalar app ': 'Install app', 'o': 'or', 'Agregar a pantalla principal': 'Add to Home screen', 'Confirma con': 'Confirm with', 'Instalar': 'Install',
  'Si no aparece la opción, recarga la página y espera unos segundos.': 'If the option doesn\'t appear, reload the page and wait a few seconds.',
  // notas de ejemplo
  'Granizo en abril. Quiere cambiar a teja arquitectónica color carbón.': 'Hail damage in April. Wants to switch to charcoal architectural shingles.',
  'Goteras en el salón social. Inspección programada el jueves 9:00.': 'Leaks in the fellowship hall. Inspection scheduled Thursday 9:00.',
  'Iglesia Bautista Central': 'Central Baptist Church',
  // actividad
  'Inspección programada': 'Inspection scheduled', 'Instalación programada para el lunes': 'Installation scheduled for Monday', 'Medición terminada: techo a cuatro aguas': 'Measurement done: hip roof',
  'Propuesta enviada al cliente': 'Proposal sent to customer', 'Propuesta generada': 'Proposal generated', 'Depósito recibido (cheque)': 'Deposit received (check)', 'Factura pagada por completo': 'Invoice paid in full',
  // avisos
  'Agrega tu llave de Google Maps en Ajustes': 'Add your Google Maps key in Settings', 'Cantidades recalculadas': 'Quantities recalculated', 'Copiado al portapapeles': 'Copied to clipboard', 'Datos importados': 'Data imported',
  'Datos restablecidos': 'Data reset', 'Dibuja tu firma en el recuadro': 'Draw your signature in the box', 'Ejemplos borrados': 'Examples deleted', 'El texto no es un respaldo válido de SmartRoof': 'That text is not a valid SmartRoof backup',
  'Escribe la dirección del trabajo para ver Street View': 'Enter the job address to see Street View', 'Escribe latitud y longitud separadas por coma': 'Enter latitude and longitude separated by a comma', 'Escribe tu nombre para firmar': 'Enter your name to sign',
  'Este dispositivo no comparte ubicación': 'This device doesn\'t share location', 'Guardado': 'Saved', 'Imagen cargada. Ahora calibra la escala.': 'Image loaded. Now calibrate the scale.', 'Instalando SmartRoof…': 'Installing SmartRoof…',
  'Logo guardado': 'Logo saved', 'No encontré esa dirección. Prueba con ciudad y código postal.': 'Couldn\'t find that address. Try adding city and ZIP code.', 'No se pudo copiar': 'Couldn\'t copy',
  'No se pudo guardar en este navegador (espacio lleno o bloqueado)': 'Couldn\'t save in this browser (storage full or blocked)', 'No se pudo leer esa imagen. Usa PNG o JPG.': 'Couldn\'t read that image. Use PNG or JPG.',
  'Pago registrado': 'Payment recorded', 'Propuesta firmada': 'Proposal signed', 'Propuesta marcada como enviada': 'Proposal marked as sent', 'Selecciona el texto y cópialo': 'Select the text and copy it', 'SmartRoof quedó instalada': 'SmartRoof is installed',
  'Todas las aristas ya tienen línea': 'Every edge already has a line', 'Trabajo eliminado': 'Job deleted', 'Ejemplos ': 'Examples',
  'La búsqueda de direcciones no funciona en esta vista previa.': 'Address search doesn\'t work in this preview.', 'No se pudo buscar la dirección. Revisa tu conexión o escribe lat, lng.': 'Couldn\'t search the address. Check your connection or enter lat, lng.',
  'La ubicación no está disponible en esta vista previa.': 'Location isn\'t available in this preview.', 'No se pudo obtener tu ubicación. Revisa el permiso del navegador.': 'Couldn\'t get your location. Check the browser permission.',
  'Este dispositivo no comparte ubicación ': 'This device doesn\'t share location', 'Escribe tu nombre ': 'Enter your name',
  'No se pudo cargar el mapa.': 'The map couldn\'t load.', 'Revisa tu conexión a internet y recarga la página.': 'Check your internet connection and reload the page.',
};
// textos con datos variables: [patrón, reemplazo] (las funciones reciben los grupos)
const EN_PATTERNS = [
  [/^(\d+) trabajos sin cerrar$/, '$1 open jobs'], [/^(\d+) de (\d+) decididos$/, '$1 of $2 decided'], [/^(\d+) trabajos aprobados o más$/, '$1 jobs approved or later'],
  [/^: (.+)$/, (m, a) => ': ' + tr(a)], [/^(.+): (.+)$/, null],
  [/^Cobrar saldo vencido de (.+)$/, 'Collect overdue balance of $1'], [/^Cobrar saldo de (.+)$/, 'Collect balance of $1'],
  [/^Con (\d+)% desperdicio$/, 'With $1% waste'], [/^Creado (.+)$/, 'Created $1'], [/^Desperdicio sugerido (\d+)%$/, 'Suggested waste $1%'],
  [/^Dibujando: (.+)$/, (m, a) => 'Drawing: ' + tr(a)], [/^Emitida (.+) · Vence (.+)$/, 'Issued $1 · Due $2'], [/^Faceta F(\d+)$/, 'Facet F$1'],
  [/^Factura (F-\d+) enviada$/, 'Invoice $1 sent'], [/^Factura (F-\d+) creada \((.+)\)$/, 'Invoice $1 created ($2)'],
  [/^Firmada por (.+) el (.+)$/, 'Signed by $1 on $2'], [/^(.+) · (.+) · Opción «(.+)»$/, (m, a, b, c) => `${a} · ${b} · Option «${tr(c)}»`],
  [/^Impuesto \((.+)%\)$/, 'Tax ($1%)'], [/^Materiales estimados \(con (\d+)% de desperdicio\)$/, 'Estimated materials (with $1% waste)'],
  [/^PASO (\d)$/, 'STEP $1'], [/^PASO (\d) · LISTO$/, 'STEP $1 · DONE'], [/^Pedido (P-\d+)$/, 'Order $1'], [/^Pedido (P-\d+): (.+)$/, (m, a, b) => `Order ${a}: ${tr(b)}`],
  [/^Pedido de material (P-\d+) creado$/, 'Material order $1 created'],
  [/^Planta (.+) ft² × (.+) =$/, 'Plan $1 ft² × $2 ='], [/^Preparado para (.+)$/, 'Prepared for $1'],
  [/^Propuesta firmada: opción «(.+)»$/, (m, a) => `Proposal signed: option «${tr(a)}»`], [/^Propuesta firmada por (.+): opción «(.+)» \((.+)\)$/, (m, a, b, c) => `Proposal signed by ${a}: option «${tr(b)}» (${c})`],
  [/^Propuesta válida hasta (.+)\. Impuesto (.+)% incluido en los totales\.$/, 'Proposal valid until $1. $2% tax included in totals.'],
  [/^Prospecto creado desde el estimador web$/, 'Lead created from the web estimator'], [/^Prospecto creado desde (.+)$/, 'Lead created from $1'], [/^Prospecto creado \((.+)\)$/, (m, a) => `Lead created (${tr(a)})`],
  [/^Saldo (.+)$/, 'Balance $1'], [/^Se creará con la opción firmada «(.+)»\.$/, (m, a) => `It will use the signed option «${tr(a)}».`],
  [/^La propuesta aún no está firmada; se usará la opción «(.+)»\.$/, (m, a) => `The proposal isn't signed yet; option «${tr(a)}» will be used.`],
  [/^Sugerido \((\d+)%\)$/, 'Suggested ($1%)'], [/^y (\d+) partidas más$/, 'and $1 more items'], [/^≈ (.+) cuadros de techo$/, '≈ $1 roofing squares'],
  [/^(.+) · ([^·]+)\/([^/]+)$/, (m, a, b, c) => `${tr(a)} · ${b}/${tr(c)}`], [/^Movido a «(.+)»$/, (m, a) => `Moved to «${tr(a)}»`],
  [/^Pago recibido: (.+) \((.+)\)$/, (m, a, b) => `Payment received: ${a} (${tr(b)})`], [/^Descuento \((.+)\)$/, 'Discount ($1)'], [/^(.+) ✓$/, (m, a) => tr(a) + ' ✓'],
  [/^Segmento: (.+) ft · clic en el primer punto o Enter para cerrar$/, 'Segment: $1 ft · click the first point or Enter to close'], [/^Segmento: (.+) ft$/, 'Segment: $1 ft'],
  [/^(\d+) puntos · Enter para cerrar · Esc para cancelar$/, '$1 points · Enter to close · Esc to cancel'], [/^Escala: 1 px = (.+) ft$/, 'Scale: 1 px = $1 ft'], [/^Escala aplicada: 1 px = (.+) ft$/, 'Scale applied: 1 px = $1 ft'],
  [/^(\d+) líneas creadas\. Revisa los tipos tocando cada línea\.$/, '$1 lines created. Check the types by tapping each line.'], [/^Nuevo prospecto: (.+)$/, 'New lead: $1'],
  [/^(.+) → (.+)$/, (m, a, b) => `${a} → ${tr(b)}`], [/^Google rechazó la llave: (.+)$/, 'Google rejected the key: $1'], [/^Depósito del (\d+)%:$/, '$1% deposit:'],
  [/^Intensidad de la marca de agua:$/, 'Watermark strength:'], [/^Descuento \((\w+)\)$/, 'Discount ($1)'],
  [/^Estimación instantánea: casa de (.+) ft², pendiente (.+), (.+)\. Rango (.+)\.$/, (m, a, b, c, d) => `Instant estimate: ${a} ft² home, ${({ 'baja (hasta 4/12)': 'low', 'media (5–7/12)': 'medium', 'media': 'medium', 'pronunciada (8/12 o más)': 'steep' })[b] || b} pitch, ${tr(c.charAt(0).toUpperCase() + c.slice(1)).toLowerCase()}. Range ${d}.`],
  [/^Opción (\d+)$/, 'Option $1'], [/^Escala aplicada(.*)$/, null],
];
function tr(s) {
  if (state?.settings?.lang !== 'en' || !s) return s;
  const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0], core = s.trim();
  if (!core) return s;
  if (Object.prototype.hasOwnProperty.call(EN, core)) return lead + EN[core] + trail;
  for (const [re, rep] of EN_PATTERNS) {
    if (!rep) continue;
    const m = core.match(re);
    if (m) return lead + (typeof rep === 'function' ? rep(...m) : core.replace(re, rep)) + trail;
  }
  return s;
}
const TR_ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
function trNode(root) {
  if (state?.settings?.lang !== 'en' || !root) return;
  if (root.nodeType === 3) { const v = tr(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; return; }
  if (root.nodeType !== 1 || root.closest?.('script,style,textarea')) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n = root;
  do {
    if (n.nodeType === 3) { if (!n.parentElement?.closest('script,style,textarea')) { const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; } }
    else for (const a of TR_ATTRS) { const v = n.getAttribute?.(a); if (v) { const t = tr(v); if (t !== v) n.setAttribute(a, t); } }
  } while ((n = w.nextNode()));
}
let trObs = null;
function applyLang() {
  const en = state.settings.lang === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  if (en && !trObs) {
    trObs = new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') trNode(m.target); else m.addedNodes.forEach(trNode); if (m.type === 'attributes') trNode(m.target); } });
    trObs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: TR_ATTRS });
    trNode(document.body);
  } else if (!en && trObs) { trObs.disconnect(); trObs = null; }
}
