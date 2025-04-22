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

const imagenesCargadas = new Map();

d3.json('assets/mapa3.json').then(data => {
  geojson = data;
  iniciarAnimacion();
  d3.timer(actualizarRotacion);
}).catch(error => {
  console.error('Error al cargar los datos:', error);
});

function isVisible([lon, lat]) {
  const rotate = projection.rotate();
  const lambda = lon + rotate[0];
  const phi = lat;
  const rad = Math.PI / 180;
  return Math.cos(phi * rad) * Math.cos(lambda * rad) > 0;
}

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

  geojson.features.forEach(feature => {
    const props = feature.properties;
    const coords = [props.label_x, props.label_y];

    if (props.icon && coords[0] != null && coords[1] != null && isVisible(coords)) {
      const [x, y] = projection(coords);
      if (!x || !y) return;

      const rutaIcono = props.icon;
      const tamaño = 20;

      if (imagenesCargadas.has(rutaIcono)) {
        const img = imagenesCargadas.get(rutaIcono);
        context.drawImage(img, x - tamaño / 2, y - tamaño / 2, tamaño, tamaño);
      } else {
        const img = new Image();
        img.src = rutaIcono;
        img.onload = () => {
          imagenesCargadas.set(rutaIcono, img);
          context.drawImage(img, x - tamaño / 2, y - tamaño / 2, tamaño, tamaño);
        };
      }
    }
  });
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

canvas.addEventListener('click', event => {
  if (!esArrastre) {
    const [x, y] = d3.pointer(event);
    const invertido = projection.invert([x, y]);

    if (invertido) {
      const [lng, lat] = invertido;
      const pais = geojson.features.find(f => d3.geoContains(f, [lng, lat]));
      if (pais) {
        const nombrePais = pais.properties.name || 'País';
        const urlNoticias = pais.properties.news_url;

        if (urlNoticias) {
          const esImagen = urlNoticias.match(/\.(jpg|jpeg|png|webp|gif)$/i);
          if (esImagen) {
            mostrarImagenLocal(urlNoticias, nombrePais);
          } else {
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
        }
      }
    }
  }
});

function mostrarImagenLocal(ruta, nombrePais) {
  const popup = document.getElementById('popup');

  const maxAncho = 300;
  const maxAlto = 300;

  const left = Math.floor(Math.random() * (window.innerWidth - maxAncho - 20));
  const top = Math.floor(Math.random() * (window.innerHeight - maxAlto - 20));

  popup.style.position = 'absolute';
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;

  popup.innerHTML = `
    <div>
      <strong>${nombrePais}</strong><br>
      <img src="${ruta}" style="max-width: ${maxAncho}px; max-height: ${maxAlto}px; margin-top: 5px; border-radius: 10px;" />
    </div>
  `;

  popup.classList.add('show');

  // 🔁 Auto-cierre después de 7 minutos
  setTimeout(() => {
    cerrarPopup();
  }, 7000);
}


function cerrarPopup() {
  const popup = document.getElementById('popup');
  popup.classList.remove('show');
}

function mostrarPopup(texto) {
  const popup = document.getElementById('popup');
  popup.innerHTML = `<p>${texto}</p>`;
  popup.style.left = '20px';
  popup.style.top = '20px';
  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 3000);
}

// Fondo con video
const videos = ['assets/video/1.mp4', 'assets/video/1.mp4'];
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
canvas.addEventListener('mousemove', function (event) {
  if (!isDragging) {
    const [x, y] = d3.pointer(event);
    const invertido = projection.invert([x, y]);

    if (invertido) {
      const [lng, lat] = invertido;
      const pais = geojson.features.find(f => d3.geoContains(f, [lng, lat]));

      // Cambia el cursor si hay enlace
      if (pais && pais.properties.news_url) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }
    } else {
      canvas.style.cursor = 'default';
    }
  }
});
console.log("Mundo.js cargado correctamente.");

// Utilidad para crear cookies con duración en minutos
function setCookie(nombre, valor, minutos) {
  const fecha = new Date();
  fecha.setTime(fecha.getTime() + (minutos * 60 * 1000));
  document.cookie = `${nombre}=${valor}; expires=${fecha.toUTCString()}; path=/`;
}

// Utilidad para obtener una cookie por nombre
function getCookie(nombre) {
  const cookies = document.cookie.split(';');
  for (let c of cookies) {
    c = c.trim();
    if (c.indexOf(nombre + "=") === 0) {
      return c.substring(nombre.length + 1);
    }
  }
  return null;
}

// Lógica principal de acceso sin bloqueo posterior
(function controlarAcceso() {
  const cookieAcceso = "acceso_mundo";
  const audio = document.getElementById("alarma-audio");

  // Establece tiempo de acceso aleatorio entre 4 y 7 minutos
  const duracionMinutos = Math.floor(Math.random() * (7 - 4 + 1)) + 4;

  let tiempoFinal;

  if (!getCookie(cookieAcceso)) {
    tiempoFinal = Date.now() + duracionMinutos * 60 * 1000;
    setCookie(cookieAcceso, tiempoFinal, duracionMinutos);
  } else {
    tiempoFinal = parseInt(getCookie(cookieAcceso), 10);
  }

  const tiempoInicio = tiempoFinal - duracionMinutos * 60 * 1000;

  // Activar audio tras interacción del usuario
  ["click", "mousemove", "keydown"].forEach(evento => {
    document.addEventListener(evento, activarAudio);
  });

  function activarAudio() {
    if (audio && audio.paused) {
      audio.volume = 0.1;
      audio.loop = true;
      audio.play().catch(err => {
        console.warn("⚠️ El navegador bloqueó el audio:", err);
      });
    }

    // Solo una vez
    ["click", "mousemove", "keydown"].forEach(evento => {
      document.removeEventListener(evento, activarAudio);
    });
  }

  // Revisión de expiración + volumen creciente
  const intervalo = setInterval(() => {
    const ahora = Date.now();
    const restante = tiempoFinal - ahora;

    if (restante <= 0) {
      clearInterval(intervalo);
      window.location.href = "final.html"; // Redirige sin bloquear
      return;
    }

    const progreso = (ahora - tiempoInicio) / (tiempoFinal - tiempoInicio);
    if (audio) {
      audio.volume = Math.min(0.1 + progreso * 0.9, 1);
    }
  }, 1000);
})();
