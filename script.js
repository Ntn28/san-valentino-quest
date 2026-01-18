// --- FASE 1: LOGIN ---

function checkCode() {
    const day = document.getElementById('slot-day').value;
    const month = document.getElementById('slot-month').value;
    const year = document.getElementById('slot-year').value;

const mapScreen = document.getElementById('map-screen');
const mapContainer = document.querySelector('.map-container');
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;

// --- FUNZIONE PER TRASCINARE LA MAPPA ---
mapScreen.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Solo tasto sinistro per muoversi
    isDragging = true;
    startX = e.pageX - mapContainer.offsetLeft;
    startY = e.pageY - mapContainer.offsetTop;
});

window.addEventListener('mouseup', () => { isDragging = false; });

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - startX;
    const y = e.pageY - startY;
    mapContainer.style.left = `${x}px`;
    mapContainer.style.top = `${y}px`;
});

// --- FUNZIONE CLICK DESTRO: COORDINATE ---
mapContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Impedisce l'apertura del menu del browser

    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;

    // Calcola la percentuale rispetto alla dimensione dell'immagine
    const topPercent = ((y / rect.height) * 100).toFixed(2);
    const leftPercent = ((x / rect.width) * 100).toFixed(2);

    const coords = `top: ${topPercent}%; left: ${leftPercent}%;`;
    
    // Copia negli appunti
    navigator.clipboard.writeText(coords).then(() => {
        alert(`Coordinate copiate!\n${coords}\n\nIncollale nel tuo file style.css sotto l'ID desiderato.`);
    });
});

// Mantieni la funzione checkCode e startGame che avevamo prima...
function checkCode() {
    const day = document.getElementById('slot-day').value;
    const month = document.getElementById('slot-month').value;
    const year = document.getElementById('slot-year').value;
    if (day === "12" && month === "08" && year === "2024") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('map-screen').classList.remove('hidden');
    } else {
        alert("Data errata!");
    }
}
    
    // Controlla se i valori sono corretti
    if (day === "12" && month === "08" && year === "2024") {
        alert("Codice Corretto! Benvenuto a Torino.");
        startGame();
    } else {
        // Cosa succede se sbaglia
        document.getElementById('error-msg').classList.remove('hidden');
        shakeScreen(); // Effetto visivo errore
    }
}

function shakeScreen() {
    const login = document.getElementById('login-screen');
    login.style.transform = "translateX(10px)";
    setTimeout(() => login.style.transform = "translateX(-10px)", 100);
    setTimeout(() => login.style.transform = "translateX(0)", 200);
}

function startGame() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
}

// --- FASE 2 & 3: MAPPE E LIVELLI ---

// Configurazione dei livelli
const levels = {
    'mole': {
        image: 'assets/mole_livello.png',
        objects: [
            { id: 1, name: 'Chiave', top: '50%', left: '20%' },
            { id: 2, name: 'Gatto', top: '80%', left: '60%' }
        ]
    },
    'cappuccini': {
        image: 'assets/cappuccini_livello.png',
        objects: []
    },
    // Aggiungi qui egizio e smashy...
};

function openLevel(placeName) {
    const levelData = levels[placeName];
    if(!levelData) return alert("Livello in costruzione!");

    // Setta l'immagine del livello
    document.getElementById('level-image').src = levelData.image;
    
    // Mostra la schermata livello
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');

    // Qui dovremmo generare gli oggetti nascosti (codice da espandere dopo)
}

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
}
