let isDragging = false;
let startX, startY;
let mapX = 0, mapY = 0, scale = 2; // Partiamo con zoom 2x
let activeContainer = null;
let currentObjectToPlace = null;

const levelsData = {
    'egizio': { image: 'egizio_interno.png', targets: ["Ciondolo", "Sfinge", "Cofanetto", "Obelisco", "Piuma", "Stela di Antonino", "Moneta d'Argento", "Moneta d'Oro", "Bussola", "Chiave", "Scarabeo", "Cartolina", "Lente", "Papiro", "Pergamena", "Statua 1", "Statua 2", "Libro"] },
    'smashy': { image: 'smashy_interno.png', targets: ["Piuma", "Toro", "Cartolina", "Torta", "Asso", "Moneta d'oro", "Paperella", "Bicerin", "Mascotte Smashy", "Conchiglia", "Portachiavi", "Smashy"] },
    'mole': { image: 'mole_interno.png', targets: ["Take a bite", "Cartolina", "Piuma", "Bandiera", "Salvadanaio", "Aereoplanino", "Binocolo", "Pop corn", "Robot", "Cappello", "Lucchetto", "Treno", "Oscar"] }
};

// --- CUORI PIÙ GRANDI E VIVI ---
function createHearts() {
    const container = document.getElementById('login-screen');
    const heartIcons = ['❤️', '💖', '💗', '💓', '🥰'];
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = heartIcons[Math.floor(Math.random() * heartIcons.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.setProperty('--d', (Math.random() * 4 + 4) + 's');
        heart.style.setProperty('--s', (Math.random() * 2 + 1)); // Dimensione varia da 1x a 3x
        heart.style.fontSize = (Math.random() * 30 + 20) + 'px';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 8000);
    }, 300);
}
createHearts();

// --- LOGIN ---
function checkCode() {
    const d = document.getElementById('slot-day').value;
    const m = document.getElementById('slot-month').value;
    const y = document.getElementById('slot-year').value;
    if (d === "12" && m === "08" && y === "2024") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('map-screen').classList.remove('hidden');
        activeContainer = document.querySelector('#map-screen .map-container');
        initCamera(2); // Inizia con zoom 2x
    } else { alert("Data errata!"); }
}

// --- SISTEMA ZOOM E TRASCINAMENTO ---
function initCamera(initialScale = null) {
    if (!activeContainer) return;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;

    if (initialScale) scale = initialScale;

    // Limite minimo: non de-zoomare oltre la dimensione dello schermo
    let minScale = Math.max(screenW / contW, screenH / contH);
    if (scale < minScale) scale = minScale;

    applyTransform();
}

function applyTransform() {
    if (!activeContainer) return;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;

    // Blocca zoom out eccessivo
    let minScale = Math.max(screenW / contW, screenH / contH);
    if (scale < minScale) scale = minScale;
    if (scale > 5) scale = 5; // Zoom massimo 5x

    // Blocca trascinamento ai bordi
    if (mapX > 0) mapX = 0;
    if (mapX < screenW - contW * scale) mapX = screenW - contW * scale;
    if (mapY > 0) mapY = 0;
    if (mapY < screenH - contH * scale) mapY = screenH - contH * scale;

    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${scale})`;
}

// FIX ZOOM: Rotellina mouse
window.addEventListener('wheel', (e) => {
    if (!activeContainer) return;
    const zoomSpeed = 0.1;
    if (e.deltaY < 0) scale += zoomSpeed;
    else scale -= zoomSpeed;
    applyTransform();
}, { passive: false });

// FIX DRAG: Rilascia sempre quando alzi il mouse
function startDrag(e) {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
    document.body.classList.add('grabbing');
}

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    mapX = e.clientX - startX;
    mapY = e.clientY - startY;
    applyTransform();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.classList.remove('grabbing');
});

document.getElementById('map-screen').addEventListener('mousedown', startDrag);
document.getElementById('level-screen').addEventListener('mousedown', startDrag);

// --- LOGICA LIVELLI E DEBUG ---
function openLevel(placeName) {
    const data = levelsData[placeName];
    document.getElementById('level-image').src = data.image;
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    activeContainer = document.getElementById('level-drag-container');
    
    // Reset posizione per i livelli (partiamo zoomati 1.5x)
    mapX = 0; mapY = 0;
    setTimeout(() => {
        initCamera(1.5);
        setupObjects(data.targets);
        setupDebug(data.targets);
    }, 150);
}

// ... setupObjects() e setupDebug() rimangono come nell'ultimo messaggio ...
// (Usa la funzione debug dell'ultimo messaggio per generare le coordinate)

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    activeContainer = document.querySelector('#map-screen .map-container');
    initCamera(1); // Torna a 1x sulla mappa principale
}
