const canvas = document.getElementById('globoCanvas');
const context = canvas.getContext('2d');

// Ajustar el tamaño del lienzo y la escala de la proyección al 50% de la ventana
canvas.width = window.innerWidth * 0.5;
canvas.height = window.innerHeight * 0.5;

// Configura la proyección ortográfica
const projection = d3.geoOrthographic()
    .scale(Math.min(canvas.width, canvas.height) / 2)
    .translate([canvas.width / 2, canvas.height / 2])
    .rotate([0, 0]);

const geoGenerator = d3.geoPath()
    .projection(projection)
    .context(context);

let geojson;
let isDragging = false;
let lastX, lastY;
let esArrastre = false;
const umbralArrastre = 5;

// Rotación automática
let autoRotate = true;
const rotationSpeed = 0.02;
let lastTime = Date.now();

// Cargar datos GeoJSON
d3.json('assets/mapa.json').then(data => {
    geojson = data;
    iniciarAnimacion();
    d3.timer(actualizarRotacion);
}).catch(error => {
    console.error('Error al cargar los datos:', error);
});

function actualizarGlobo() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja el globo
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

// Eventos de arrastre
canvas.addEventListener('mousedown', function(event) {
    isDragging = true;
    esArrastre = false;
    autoRotate = false;
    lastX = event.clientX;
    lastY = event.clientY;
});

canvas.addEventListener('mousemove', function(event) {
    if (isDragging) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;

        if (Math.sqrt(dx * dx + dy * dy) > umbralArrastre) {
            esArrastre = true;
        }

        const rotation = projection.rotate();
        const scale = projection.scale();
        const sensitivity = 75 / scale;

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
    autoRotate = true;
});

canvas.addEventListener('mouseleave', function() {
    isDragging = false;
    autoRotate = true;
});

// Click para mostrar popup y abrir enlace
canvas.addEventListener('click', function(event) {
    if (!esArrastre) {
        const [x, y] = d3.pointer(event);
        const invertido = projection.invert([x, y]);

        if (invertido) {
            const [lng, lat] = invertido;
            const pais = geojson.features.find(f => d3.geoContains(f, [lng, lat]));

            if (pais) {
                const nombrePais = pais.properties.ADMIN || pais.properties.name || 'No identificado';
                const urlNoticias = pais.properties.news_url;

                mostrarPopup(`Abriendo noticias de ${nombrePais}...`);

                if (urlNoticias) {
                    window.open(urlNoticias, '_blank');
                }
            }
        }
    }
});

// Rotación automática
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

// Función para mostrar el popup flotante
function mostrarPopup(texto) {
    const popup = document.getElementById('popup');
    popup.textContent = texto;
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
    }, 2500);
}

const videos = [
    'assets/video/prueba3.mp4',
    'assets/video/prueba2.mp4',
    'assets/video/prueba1.mp4',
  ];
  
  // Mezclar aleatoriamente el orden
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  shuffleArray(videos);
  
  const videoPlayer = document.getElementById('background-video');
  let currentIndex = 0;
  
  // Asegura que el video esté silenciado (requerido por navegadores)
  videoPlayer.muted = true;
  
  function playNextVideo() {
    videoPlayer.style.opacity = 0;
  
    setTimeout(() => {
      videoPlayer.src = videos[currentIndex];
      videoPlayer.load();
      videoPlayer.play().catch(err => {
        console.warn("Reproducción bloqueada por el navegador:", err);
      });
  
      videoPlayer.onended = () => {
        currentIndex = (currentIndex + 1) % videos.length;
        playNextVideo(); // Reproduce el siguiente video
      };
  
      videoPlayer.style.opacity = 1;
    }, 500); // transiciones suaves
  }
  
  // Inicia la secuencia de reproducción
  playNextVideo();
  