// Este script controla el acceso a una página web mediante cookies.
// Si el usuario no tiene acceso, se le redirige a otra página.
// Si tiene acceso, se le permite permanecer en la página por un tiempo limitado.
// Si el tiempo expira, se le bloquea el acceso por 30 minutos.
// Se utilizan cookies para gestionar el acceso y el bloqueo.
// Se establece una cookie de acceso con un tiempo aleatorio entre 4 y 7 minutos.
// Si el usuario intenta acceder después de que la cookie de acceso haya expirado, se le redirige a la página de inicio y se establece una cookie de bloqueo por 30 minutos
function setCookie(nombre, valor, minutos) {
  const fecha = new Date();
  fecha.setTime(fecha.getTime() + (minutos * 60 * 1000));
  document.cookie = `${nombre}=${valor}; expires=${fecha.toUTCString()}; path=/`;
}

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

(function controlarAcceso() {
  const cookieAcceso = "acceso_mundo";
  const cookieBloqueado = "bloqueado_mundo";

  // Si está bloqueado, redirigir inmediatamente
  if (getCookie(cookieBloqueado)) {
    console.warn("⛔ Acceso bloqueado");
    window.location.href = "final.html";
    return;
  }

  // Si tiene acceso válido, continuar
  if (!getCookie(cookieAcceso)) {
    const minutos = Math.floor(Math.random() * (7 - 4 + 1)) + 4;
    setCookie(cookieAcceso, "activo", minutos);
    console.log(`✅ Acceso concedido por ${minutos} minutos`);
  } 

  // Revisar si se expiró la cookie de acceso
  const checkInterval = setInterval(() => {
    if (!getCookie(cookieAcceso)) {
      clearInterval(checkInterval);
      alert("⛔ Tu tiempo expiró. No podrás volver por 30 minutos.");

      // Establecer bloqueo de 30 minutos
      setCookie(cookieBloqueado, "true", 30);
      window.location.href = "final.html";
    }
  }, 1000);
})();
