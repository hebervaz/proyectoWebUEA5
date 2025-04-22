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

// Lógica principal de acceso y control de tiempo
(function controlarAcceso() {
  const cookieAcceso = "acceso_mundo";
  const cookieBloqueado = "bloqueado_mundo";
  const audio = document.getElementById("alarma-audio");

  // Si está bloqueado => redirigir a final.html
  if (getCookie(cookieBloqueado)) {
    window.location.href = "final.html";
    return;
  }

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

  // Esperar interacción del usuario para activar audio
  function activarAudio() {
    if (audio && audio.paused) {
      audio.volume = 0.1;
      audio.loop = true;
      audio.play().then(() => {
        console.log("🔊 Audio activado por el usuario.");
      }).catch(err => {
        console.warn("⚠️ Error al reproducir audio:", err);
      });
    }
    document.removeEventListener("click", activarAudio);
  }
  document.addEventListener("click", activarAudio);

  // Monitoreo de expiración + volumen creciente
  const intervalo = setInterval(() => {
    const ahora = Date.now();
    const restante = tiempoFinal - ahora;

    if (restante <= 0) {
      clearInterval(intervalo);
      setCookie(cookieBloqueado, "true", 30); // Cambia 30 si quieres bloquear por más o menos tiempo
      window.location.href = "final.html";
      return;
    }

    const progreso = (ahora - tiempoInicio) / (tiempoFinal - tiempoInicio);
    if (audio) {
      audio.volume = Math.min(0.1 + progreso * 0.9, 1);
    }
  }, 1000);
})();
