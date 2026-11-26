# Gestor Académico de Tareas

Aplicación web sencilla para organizar actividades académicas. Está construida únicamente con HTML, CSS y JavaScript; no necesita Python, Flask, base de datos, Docker ni servidor backend.

## Características

- Crear, editar y eliminar tareas.
- Descripción, fecha de entrega y prioridad.
- Estados: pendiente, en progreso y completada.
- Búsqueda y filtros por estado.
- Ordenar por fecha, prioridad o creación.
- Indicadores de tareas.
- Persistencia en LocalStorage del navegador.
- Diseño adaptable a computadoras, tabletas y celulares.

## Estructura

```text
Gestor-Academico-Web/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── README.md
```

## Cómo ejecutar

1. Extrae el archivo ZIP.
2. Abre la carpeta `Gestor-Academico-Web`.
3. Haz doble clic en `index.html`.
4. La página se abrirá en tu navegador.

También puedes abrir la carpeta en Visual Studio Code y utilizar la extensión Live Server si deseas recarga automática al editar.

## Almacenamiento

Las tareas se guardan en LocalStorage del navegador. No se envían a un servidor. Si borras los datos del sitio/navegador, puedes perder las tareas guardadas. Los datos permanecen en el mismo navegador y perfil del dispositivo.

## Tecnologías

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage

No requiere instalación de paquetes ni conexión a internet para las funciones principales. La tipografía externa puede usar una fuente local alternativa si no hay conexión.
