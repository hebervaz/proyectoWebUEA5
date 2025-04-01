function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}

function setAlarm() {
    const alarmInput = document.getElementById("alarmTime").value;
    if (alarmInput) {
        // Ocultar todo y poner pantalla en negro
        document.body.style.backgroundColor = "black";
        document.body.innerHTML = ""; 

        // Generar un tiempo de espera aleatorio entre 5 y 10 segundos
        const delay = Math.random() * (3 - 1) + 1;

        setTimeout(() => {
            window.location.href = "home.html"; 
        }, delay * 1000); // Convertir a milisegundos
    } else {
        alert("Por favor, ingresa una hora válida.");
    }
}

setInterval(updateClock, 1000);
updateClock();
