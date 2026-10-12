import pathlib
d = pathlib.Path(__file__).parent
shell = (d/'src/shell.html').read_text()
out = shell.replace('/*LEAFLET_CSS*/', (d/'src/leaflet.css').read_text()).replace('/*APP_CSS*/', (d/'src/styles.css').read_text()).replace('/*APP_JS*/', (d/'src/i18n.js').read_text() + '\n' + (d/'src/app.js').read_text())
(d/'artifact.html').write_text(out)
# versión independiente para abrir directo en el navegador
(d/'index.html').write_text('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<link rel="manifest" href="manifest.webmanifest">\n<meta name="theme-color" content="#1f2b3b">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="SmartRoof">\n<meta name="mobile-web-app-capable" content="yes">\n</head>\n<body>\n' + out + '\n</body>\n</html>\n')
print(len(out))
