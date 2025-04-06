function updateClock() {
    let hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    let minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    let seconds = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    let timeString = hours + ':' + minutes + ':' + seconds;
    
    const clockDiv = document.getElementById('clock');
    clockDiv.innerHTML = '';
    
    for (let i = 0; i < timeString.length; i++) {
        let char = timeString[i];
        let digitDiv = document.createElement('div');
        digitDiv.classList.add('digit');
        digitDiv.textContent = char;
        clockDiv.appendChild(digitDiv);
        
        setInterval(() => {
            digitDiv.textContent = Math.random() > 0.5 ? Math.floor(Math.random() * 10) : char;
        }, Math.random() * 500 + 100);
    }
}

setInterval(updateClock, 1000);
updateClock();

// Inicializar el mapa con Leaflet.js
var map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Agregar marcadores con enlaces a noticias
var locations = [
    { coords: [51.5074, -0.1278], url: 'https://www.bbc.com/', name: 'Reino Unido' },
    { coords: [40.7128, -74.0060], url: 'https://www.nytimes.com/', name: 'EE.UU.' },
    { coords: [-33.8688, 151.2093], url: 'https://www.smh.com.au/', name: 'Australia' }, // Sydney
    { coords: [48.8566, 2.3522], url: 'https://www.lemonde.fr/', name: 'Francia' }, // París
    { coords: [39.9042, 116.4074], url: 'https://www.globaltimes.cn/', name: 'China' }, // Pekín
    { coords: [35.6895, 139.6917], url: 'https://www.japantimes.co.jp/', name: 'Japón' }, // Tokio
    { coords: [55.7558, 37.6173], url: 'https://tass.com/', name: 'Rusia' }, // Moscú
    { coords: [19.4326, -99.1332], url: 'https://www.excelsior.com.mx/', name: 'Ciudad de México' }, // Ciudad de México
    { coords: [40.7306, -73.9352], url: 'https://www.nytimes.com/', name: 'Brooklyn, EE. UU.' }, // Brooklyn
];

locations.forEach(location => {
    L.marker(location.coords).addTo(map)
        .bindPopup(`<a href="#" onclick="openPopup('${location.url}')">${location.name}</a>`);
});

// Función para abrir el enlace en un popup
function openPopup(url) {
    window.open(url, 'popup', 'width=800,height=600,scrollbars=yes,resizable=yes');
}