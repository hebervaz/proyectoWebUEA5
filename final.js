const tiempoElemento = document.getElementById("tiempo");
const contadorTexto = document.getElementById("contador");

// Obtenemos la última vez que se vio "mundo.html"
const ultimaVisita = localStorage.getItem("ultimaVisitaMundo");
const ahora = new Date().getTime();
const minutos30 = 30 * 60 * 1000;

if (ultimaVisita && ahora - ultimaVisita < minutos30) {
  // Si sí han pasado 30 minutos (o nunca la ha visto), dejar ver con cuenta regresiva
  let segundos = 5;
  tiempoElemento.textContent = segundos;

  const cuentaRegresiva = setInterval(() => {
    segundos--;
    tiempoElemento.textContent = segundos;

    if (segundos <= 0) {
      clearInterval(cuentaRegresiva);
      window.location.href = "mundo.html";
    }
  }, 1000);
}
