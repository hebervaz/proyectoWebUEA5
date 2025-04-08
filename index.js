        function updateClock() {
            let hours = Math.floor(Math.random() * 24);
            let minutes = Math.floor(Math.random() * 60);
            let seconds = Math.floor(Math.random() * 60);

            let timeString = 
                String(hours).padStart(2, '0') + ":" + 
                String(minutes).padStart(2, '0') + ":" + 
                String(seconds).padStart(2, '0');

            const clockDiv = document.getElementById('clock');
            clockDiv.innerHTML = '';

            for (let i = 0; i < timeString.length; i++) {
                let char = timeString[i];
                let digitDiv = document.createElement('div');
                digitDiv.classList.add('digit');
                digitDiv.textContent = char;

                let glitchDiv = document.createElement('div');
                glitchDiv.classList.add('digit', 'glitch');
                glitchDiv.textContent = Math.floor(Math.random() * 10);

                digitDiv.appendChild(glitchDiv);
                clockDiv.appendChild(digitDiv);

                // Cambia los números aleatoriamente
                setInterval(() => {
                    if (Math.random() > 0.5) {
                        digitDiv.textContent = Math.floor(Math.random() * 10);
                    } else {
                        digitDiv.textContent = char;
                    }
                }, Math.random() * 500 + 100);

                setTimeout(() => {
                    glitchDiv.textContent = char;
                    glitchDiv.style.opacity = 0;
                }, Math.random() * 300);
            }
        }

        setInterval(updateClock, 500);
        updateClock();

        function redirectToPage() {
            window.location.href = "cargando.html";  
        }

