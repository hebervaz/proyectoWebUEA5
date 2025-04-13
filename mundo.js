const canvas = document.getElementById('globoCanvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.5;
canvas.height = window.innerHeight * 0.5;

const projection = d3.geoOrthographic()
  .scale(Math.min(canvas.width, canvas.height) / 2)
  .translate([canvas.width / 2, canvas.height / 2])
  .rotate([0, 0]);

const geoGenerator = d3.geoPath().projection(projection).context(context);

let geojson;
let isDragging = false, lastX, lastY, esArrastre = false;
const umbralArrastre = 5;
let autoRotate = true;
const rotationSpeed = 0.015;
let lastTime = Date.now();

d3.json('assets/mapa1.json').then(data => {
  geojson = data;
  iniciarAnimacion();
  d3.timer(actualizarRotacion);
}).catch(error => {
  console.error('Error al cargar los datos:', error);
});

function actualizarGlobo() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, projection.scale(), 0, 2 * Math.PI);
  context.fillStyle = '#001f3f';
  context.fill();

  context.beginPath();
  geoGenerator({ type: 'FeatureCollection', features: geojson.features });
  context.fillStyle = '#28ffc6';
  context.fill();
  context.strokeStyle = '#28ffc6';
  context.lineWidth = 0.5;
  context.stroke();

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

canvas.addEventListener('mousedown', e => {
  isDragging = true;
  esArrastre = false;
  autoRotate = false;
  lastX = e.clientX;
  lastY = e.clientY;
});

canvas.addEventListener('mousemove', e => {
  if (isDragging) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (Math.sqrt(dx * dx + dy * dy) > umbralArrastre) esArrastre = true;

    const rotation = projection.rotate();
    const scale = projection.scale();
    const sensitivity = 75 / scale;
    projection.rotate([rotation[0] + dx * sensitivity, rotation[1] - dy * sensitivity]);

    lastX = e.clientX;
    lastY = e.clientY;
    actualizarGlobo();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  autoRotate = true;
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
  autoRotate = true;
});

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

// Clic para abrir noticias con popup aleatorio
canvas.addEventListener('click', event => {
  if (!esArrastre) {
    const [x, y] = d3.pointer(event);
    const invertido = projection.invert([x, y]);

    if (invertido) {
      const [lng, lat] = invertido;
      const pais = geojson.features.find(f => d3.geoContains(f, [lng, lat]));
      if (pais) {
        const nombrePais = pais.properties.ADMIN || 'País';
        const urlNoticias = pais.properties.news_url;

        mostrarPopup(`Cargando noticias de ${nombrePais}...`);

        if (urlNoticias) {
          const anchoPopup = 500;
          const altoPopup = 400;
          const left = Math.floor(Math.random() * (window.screen.width - anchoPopup));
          const top = Math.floor(Math.random() * (window.screen.height - altoPopup));

          window.open(
            urlNoticias,
            'popup',
            `width=${anchoPopup},height=${altoPopup},left=${left},top=${top},scrollbars=yes,resizable=yes`
          );
        }
      } else {
        mostrarPopup('No se detectó un país.');
      }
    }
  }
});

function mostrarPopup(texto) {
  const popup = document.getElementById('popup');
  popup.textContent = texto;
  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 2500);
}

// Fondo con videos aleatorios
const videos = [
  'assets/video/1.mp4'
];

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

shuffleArray(videos);
const videoPlayer = document.getElementById('background-video');
let currentIndex = 0;

videoPlayer.muted = true;

function playNextVideo() {
  videoPlayer.style.opacity = 0;
  setTimeout(() => {
    videoPlayer.src = videos[currentIndex];
    videoPlayer.load();
    videoPlayer.play().catch(err => {
      console.warn("Reproducción bloqueada:", err);
    });
    videoPlayer.onended = () => {
      currentIndex = (currentIndex + 1) % videos.length;
      playNextVideo();
    };
    videoPlayer.style.opacity = 1;
  }, 500);
}

playNextVideo();

