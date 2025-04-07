const canvas = document.getElementById('globoCanvas');
const context = canvas.getContext('2d');

// Ajustar el tamaño del lienzo y la escala de la proyección al 50% de la ventana
canvas.width = window.innerWidth * 0.5;
canvas.height = window.innerHeight * 0.5;

// Configura la proyección ortográfica
const projection = d3.geoOrthographic()
    .scale(Math.min(canvas.width, canvas.height) / 2) // Ajusta la escala según el tamaño del lienzo
    .translate([canvas.width / 2, canvas.height / 2]) // Centrado del globo
    .rotate([0, 0]); // Rotación inicial

const geoGenerator = d3.geoPath()
    .projection(projection)
    .context(context);

let geojson;
let isDragging = false;
let lastX, lastY;
let esArrastre = false; // Variable para controlar si hubo arrastre
const umbralArrastre = 5; // Umbral en píxeles para considerar un movimiento como arrastre

// Variables para la rotación automática
let autoRotate = true;
const rotationSpeed = 0.02; // Velocidad de rotación automática
let lastTime = Date.now(); // Marca de tiempo inicial

// Carga los datos GeoJSON
d3.json('assets/mapa.json').then(data => {
    geojson = data;
    iniciarAnimacion();
    d3.timer(actualizarRotacion); // Inicia el temporizador de rotación
}).catch(error => {
    console.error('Error al cargar los datos:', error);
});

function actualizarGlobo() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja el globo (círculo)
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, projection.scale(), 0, 2 * Math.PI);
    context.fillStyle = '#001f3f';
    context.fill();

    // Dibuja los países
    context.beginPath();
    geoGenerator({ type: 'FeatureCollection', features: geojson.features });
    context.fillStyle = '#28ffc6';
    context.fill();
    context.strokeStyle = '#28ffc6';
    context.lineWidth = 0.5;
    context.stroke();

    // Dibuja la retícula
    const graticule = d3.geoGraticule();
    context.beginPath();
    geoGenerator(graticule());
    context.strokeStyle = '#dddddd';
    context.lineWidth = 0.3;
    context.stroke();
}

function iniciarAnimacion() {
    d3.timer(actualizarGlobo);
}

// Manejadores de eventos para el arrastre
canvas.addEventListener('mousedown', function(event) {
    isDragging = true;
    esArrastre = false; // Reinicia la variable al iniciar el clic
    autoRotate = false; // Detiene la rotación automática
    lastX = event.clientX;
    lastY = event.clientY;
});

canvas.addEventListener('mousemove', function(event) {
    if (isDragging) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;

        // Si el movimiento supera el umbral, se considera un arrastre
        if (Math.sqrt(dx * dx + dy * dy) > umbralArrastre) {
            esArrastre = true;
        }

        const rotation = projection.rotate();
        const scale = projection.scale();
        const sensitivity = 75 / scale; // Sensibilidad del arrastre

        const newRotation = [
            rotation[0] + dx * sensitivity,
            rotation[1] - dy * sensitivity
        ];

        projection.rotate(newRotation);
        lastX = event.clientX;
        lastY = event.clientY;
        actualizarGlobo();
    }
});

canvas.addEventListener('mouseup', function() {
    isDragging = false;
    autoRotate = true; // Reactiva la rotación automática
});

canvas.addEventListener('mouseleave', function() {
    isDragging = false;
    autoRotate = true; // Reactiva la rotación automática
});

// Manejador de clics para detectar el país seleccionado
canvas.addEventListener('click', function(event) {
    if (!esArrastre) { // Solo ejecuta si no hubo arrastre
        const [x, y] = d3.pointer(event);
        const invertido = projection.invert([x, y]);

        if (invertido) {
            const [lng, lat] = invertido;
            const pais = geojson.features.find(f => d3.geoContains(f, [lng, lat]));

            if (pais) {
                const nombrePais = pais.properties.ADMIN || pais.properties.name || 'No identificado';
                alert(`Este país es: ${nombrePais}`);
            } else {
                alert('No se ha seleccionado ningún país.');
            }
        }
    }
});

// Función para actualizar la rotación automática
function actualizarRotacion() {
    if (autoRotate) {
        const now = Date.now();
        const elapsed = now - lastTime;
        lastTime = now;
        const rotation = projection.rotate();
        projection.rotate([rotation[0] + rotationSpeed * elapsed, rotation[1]]);
        actualizarGlobo();
    }
}
