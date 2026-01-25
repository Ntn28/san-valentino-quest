let isDragging = false;
let startX, startY;
let mapX = 0, mapY = 0, scale = 1;
let activeContainer = null;
let currentObjectToPlace = null;

const levelsData = {
    'egizio': { image: 'egizio_interno.png', targets: ["Ciondolo", "Sfinge", "Cofanetto", "Obelisco", "Piuma", "Stela di Antonino", "Moneta d'Argento", "Moneta d'Oro", "Bussola", "Chiave", "Scarabeo", "Cartolina", "Lente", "Papiro", "Pergamena", "Statua 1", "Statua 2", "Libro"] },
    'smashy': { image: 'smashy_interno.png', targets: ["Piuma", "Toro", "Cartolina", "Torta", "Asso", "Moneta d'oro", "Paperella", "Bicerin", "Mascotte Smashy", "Conchiglia", "Portachiavi", "Smashy"] },
    'mole': { image: 'mole_interno.png', targets: ["Take a bite", "Cartolina", "Piuma", "Bandiera", "Salvadanaio", "Aereoplanino", "Binocolo", "Pop corn", "Robot", "Cappello", "Lucchetto", "Treno", "Oscar"] }
};

// --- LOGIN & CUORI (Invariati) ---
function createHearts() {
    const container = document.getElementById('login-screen');
    setInterval(() => {
        if (document.getElementById('login-screen').classList.contains('hidden')) return;
        const heart = document.createElement('div');
        heart.className = 'heart'; heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = Math.random() * 50 + 20 + 'px';
        heart.style.animationDuration = Math.random() * 3 + 4 + 's';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 7000);
    }, 300);
}
createHearts();

function checkCode() {
    const d = document.getElementById('slot-day').value;
    const m = document.getElementById('slot-month').value;
    const y = document.getElementById('slot-year').value;
    if (d === "12" && m === "08" && y === "2024") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('map-screen').classList.remove('hidden');
        activeContainer = document.querySelector('#map-screen .map-container');
        setTimeout(() => initCamera(true), 100);
    } else { alert("Data errata!"); }
}

// --- SISTEMA CAMERA CON LOCK ---
function initCamera(resetZoom = false) {
    if (!activeContainer) return;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;

    let minScale = Math.max(screenW / contW, screenH / contH);
    
    if (resetZoom) {
        scale = minScale; // Parte a tutto schermo
        mapX = (screenW - contW * scale) / 2;
        mapY = (screenH - contH * scale) / 2;
    }
    applyTransform();
}

function applyTransform() {
    if (!activeContainer) return;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;

    let minScale = Math.max(screenW / contW, screenH / contH);
    if (scale < minScale) scale = minScale;
    if (scale > 5) scale = 5; // LOCK MASSIMO

    if (mapX > 0) mapX = 0;
    if (mapX < screenW - contW * scale) mapX = screenW - contW * scale;
    if (mapY > 0) mapY = 0;
    if (mapY < screenH - contH * scale) mapY = screenH - contH * scale;

    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${scale})`;
}

window.addEventListener('wheel', (e) => {
    if (!activeContainer) return;
    e.preventDefault();

    const zoomSpeed = 0.1;
    const oldScale = scale;

    // Calcolo nuova scala con blocco immediato
    let newScale = e.deltaY < 0 ? scale * (1 + zoomSpeed) : scale / (1 + zoomSpeed);
    
    // Limiti scala
    const screenW = window.innerWidth, screenH = window.innerHeight;
    let minScale = Math.max(screenW / activeContainer.offsetWidth, screenH / activeContainer.offsetHeight);
    newScale = Math.min(Math.max(newScale, minScale), 5);

    if (newScale !== oldScale) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const ratio = newScale / oldScale;

        mapX = mouseX - (mouseX - mapX) * ratio;
        mapY = mouseY - (mouseY - mapY) * ratio;
        scale = newScale;
        applyTransform();
    }
}, { passive: false });

// --- DRAG ---
window.addEventListener('mousedown', (e) => {
    if (!activeContainer || e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeContainer) return;
    mapX = e.clientX - startX;
    mapY = e.clientY - startY;
    applyTransform();
});

window.addEventListener('mouseup', () => isDragging = false);

// --- LOGICA LIVELLI ---
function openLevel(placeName) {
    const data = levelsData[placeName];
    const levelImg = document.getElementById('level-image');
    levelImg.src = data.image;
    
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    activeContainer = document.getElementById('level-drag-container');
    
    levelImg.onload = () => {
        initCamera(true);
        setupObjects(data.targets);
        setupDebug(data.targets);
    };
}

function setupObjects(targets) {
    const tray = document.getElementById('objects-to-find');
    tray.innerHTML = '';
    targets.forEach(name => {
        const id = name.toLowerCase().replace(/ /g, '_').replace(/'/g, '');
        const slot = document.createElement('div');
        slot.className = 'target-item';
        slot.id = `tray-${id}`;
        slot.innerHTML = `<img src="assets/${id}.png" onerror="this.src='https://via.placeholder.com/50?text=?'"><span>${name}</span>`;
        tray.appendChild(slot);
    });
}

// --- DEBUG TOOL ---
function setupDebug(targets) {
    let panel = document.getElementById('debug-panel') || document.createElement('div');
    panel.id = 'debug-panel';
    document.body.appendChild(panel);
    panel.innerHTML = '<b>MODALITÀ DEBUG</b><br><hr>';
    targets.forEach(name => {
        const dObj = document.createElement('div');
        dObj.style.cursor = "pointer";
        dObj.innerText = "• " + name;
        dObj.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('#debug-panel div').forEach(el => el.style.color = 'white');
            dObj.style.color = '#0f0';
            currentObjectToPlace = name;
        };
        panel.appendChild(dObj);
    });
}

// Click per registrare posizione
document.getElementById('level-image').addEventListener('click', function(e) {
    if (!currentObjectToPlace) return;

    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const topPct = ((y / this.offsetHeight) * 100).toFixed(2);
    const leftPct = ((x / this.offsetWidth) * 100).toFixed(2);

    console.log(`{ id: '${currentObjectToPlace.toLowerCase().replace(/ /g, '_')}', name: '${currentObjectToPlace}', top: '${topPct}%', left: '${leftPct}%' },`);
    
    // Crea quadratino visivo di conferma
    const marker = document.createElement('div');
    marker.className = 'hotspot-debug';
    marker.style.top = topPct + "%"; marker.style.left = leftPct + "%";
    marker.style.width = "40px"; marker.style.height = "40px";
    document.getElementById('interactive-objects').appendChild(marker);
    
    alert(`Posizione registrata per: ${currentObjectToPlace}`);
});

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    activeContainer = document.querySelector('#map-screen .map-container');
    initCamera(true);
}
