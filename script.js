let isDragging = false;
let startX, startY;
let mapX = 0;
let mapY = 0;

const mapScreen = document.getElementById('map-screen');
const mapContainer = document.querySelector('.map-container');

// --- GESTIONE LOGIN ---
function checkCode() {
    const day = document.getElementById('slot-day').value;
    const month = document.getElementById('slot-month').value;
    const year = document.getElementById('slot-year').value;

    if (day === "12" && month === "08" && year === "2024") {
        startGame();
    } else {
        document.getElementById('error-msg').classList.remove('hidden');
        const login = document.getElementById('login-screen');
        login.style.transform = "translateX(10px)";
        setTimeout(() => login.style.transform = "translateX(-10px)", 100);
        setTimeout(() => login.style.transform = "translateX(0)", 200);
    }
}

function startGame() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
}

// --- GESTIONE MOVIMENTO MAPPA (PAN) ---
mapScreen.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    // Calcola nuova posizione
    let newX = e.clientX - startX;
    let newY = e.clientY - startY;

    // --- VINCOLI (BOUNDS) ---
    // Larghezza e altezza dello schermo e della mappa
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const mapW = mapContainer.offsetWidth;
    const mapH = mapContainer.offsetHeight;

    // Limiti orizzontali
    if (newX > 0) newX = 0;
    if (newX < screenW - mapW) newX = screenW - mapW;

    // Limiti verticali
    if (newY > 0) newY = 0;
    if (newY < screenH - mapH) newY = screenH - mapH;

    mapX = newX;
    mapY = newY;

    mapContainer.style.transform = `translate(${mapX}px, ${mapY}px)`;
});

// --- GESTIONE LIVELLI ---
function openLevel(placeName) {
    alert("Hai cliccato su: " + placeName + ". Ora carichiamo il livello!");
    // Qui aggiungeremo la logica per cambiare immagine e mostrare oggetti
}

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
}
