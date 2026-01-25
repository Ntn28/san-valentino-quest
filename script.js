let isDragging = false;
let startX, startY;
let mapX = 0, mapY = 0, scale = 1;
let activeContainer = null;
let currentObjectToPlace = null;

const levelsData = {
    'egizio': {
        image: 'egizio_interno.png',
        targets: ["Ciondolo", "Sfinge", "Cofanetto", "Obelisco", "Piuma", "Stela di Antonino", "Moneta d'Argento", "Moneta d'Oro", "Bussola", "Chiave", "Scarabeo", "Cartolina", "Lente", "Papiro", "Pergamena", "Statua 1", "Statua 2", "Libro"]
    },
    'smashy': {
        image: 'smashy_interno.png',
        targets: ["Piuma", "Toro", "Cartolina", "Torta", "Asso", "Moneta d'oro", "Paperella", "Bicerin", "Mascotte Smashy", "Conchiglia", "Portachiavi", "Smashy"]
    },
    'mole': {
        image: 'mole_interno.png',
        targets: ["Take a bite", "Cartolina", "Piuma", "Bandiera", "Salvadanaio", "Aereoplanino", "Binocolo", "Pop corn", "Robot", "Cappello", "Lucchetto", "Treno", "Oscar"]
    }
};

// --- CUORI GRANDI E VIVI ---
function createHearts() {
    const container = document.getElementById('login-screen');
    const heartSymbols = ['❤️', '💖', '💝', '💕'];
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDelay = Math.random() * 8 + 's';
        heart.style.fontSize = Math.random() * 30 + 30 + 'px'; // Cuori più grandi
        container.appendChild(heart);
    }
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
        setTimeout(initCamera, 100);
    } else { alert("Data errata!"); }
}

// --- SISTEMA CAMERA: ZOOM SUL PUNTATORE ---

function initCamera() {
    if (!activeContainer) return;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const imgW = activeContainer.offsetWidth;
    const imgH = activeContainer.offsetHeight;

    // Parte con l'immagine che copre perfettamente l'altezza dello schermo
    scale = screenH / imgH;
    mapX = (screenW - imgW * scale) / 2;
    mapY = 0;
    applyTransform();
}

function applyTransform() {
    if (!activeContainer) return;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const imgW = activeContainer.offsetWidth;
    const imgH = activeContainer.offsetHeight;

    // Limiti zoom (minimo per non vedere il nero)
    let minScale = Math.max(screenW / imgW, screenH / imgH);
    if (scale < minScale) scale = minScale;
    if (scale > 5) scale = 5;

    // Limiti trascinamento
    if (mapX > 0) mapX = 0;
    if (mapY > 0) mapY = 0;
    if (mapX < screenW - imgW * scale) mapX = screenW - imgW * scale;
    if (mapY < screenH - imgH * scale) mapY = screenH - imgH * scale;

    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${scale})`;
}

// ZOOM SUL PUNTATORE MOUSE
window.addEventListener('wheel', (e) => {
    if (!activeContainer) return;
    e.preventDefault();

    const zoomSpeed = 0.1;
    const oldScale = scale;
    
    // Direzione dello zoom
    if (e.deltaY < 0) scale *= (1 + zoomSpeed);
    else scale /= (1 + zoomSpeed);

    // Calcolo per zoomare verso il mouse
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    mapX = mouseX - (mouseX - mapX) * (scale / oldScale);
    mapY = mouseY - (mouseY - mapY) * (scale / oldScale);

    applyTransform();
}, { passive: false });

// --- DRAG FLUIDO ---
window.addEventListener('mousedown', (e) => {
    if (!activeContainer || e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
    document.body.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    mapX = e.clientX - startX;
    mapY = e.clientY - startY;
    applyTransform();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.cursor = 'default';
});

// --- LIVELLI & DEBUG (INVARIATO) ---
function openLevel(placeName) {
    const data = levelsData[placeName];
    document.getElementById('level-image').src = data.image;
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    activeContainer = document.getElementById('level-drag-container');
    
    setTimeout(() => {
        initCamera();
        setupObjects(data.targets);
        setupDebug(data.targets);
    }, 100);
}

function setupObjects(targets) {
    const tray = document.getElementById('objects-to-find');
    tray.innerHTML = '';
    targets.forEach(name => {
        const id = name.toLowerCase().replace(/ /g, '_');
        const slot = document.createElement('div');
        slot.className = 'target-item';
        slot.id = `tray-${id}`;
        slot.innerHTML = `<img src="assets/${id}.png" onerror="this.src='https://via.placeholder.com/50?text=?'"><span>${name}</span>`;
        tray.appendChild(slot);
    });
}

function setupDebug(targets) {
    let panel = document.getElementById('debug-panel');
    if (!panel) {
        panel = document.createElement('div'); panel.id = 'debug-panel';
        document.body.appendChild(panel);
    }
    panel.innerHTML = '<h3>Debug Mode</h3><p>Seleziona e clicca sulla mappa:</p>';
    targets.forEach(name => {
        const dObj = document.createElement('div');
        dObj.style.cursor = "pointer"; dObj.innerText = name;
        dObj.onclick = () => {
            currentObjectToPlace = name;
            dObj.style.color = "yellow";
        };
        panel.appendChild(dObj);
    });
}

document.getElementById('level-image').onclick = function(e) {
    if (!currentObjectToPlace) return;
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const topPct = ((y / this.offsetHeight) * 100).toFixed(2);
    const leftPct = ((x / this.offsetWidth) * 100).toFixed(2);
    console.log(`{ id: '${currentObjectToPlace.toLowerCase()}', name: '${currentObjectToPlace}', top: '${topPct}%', left: '${leftPct}%' },`);
    alert("Salvato in console!");
};

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    activeContainer = document.querySelector('#map-screen .map-container');
    initCamera();
}
