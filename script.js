let isDragging = false;
let hasMoved = false; 
let startX, startY;
let mapX = 0, mapY = 0, scale = 1;
let activeContainer = null;
let currentObjectToPlace = null;

const levelsData = {
    'egizio': { image: 'egizio_interno.png', targets: ["Ciondolo", "Sfinge", "Cofanetto", "Obelisco", "Piuma", "Stela di Antonino", "Moneta d'Argento", "Moneta d'Oro", "Bussola", "Chiave", "Scarabeo", "Cartolina", "Lente", "Papiro", "Pergamena", "Statua 1", "Statua 2", "Libro"] },
    'smashy': { image: 'smashy_interno.png', targets: ["Piuma", "Toro", "Cartolina", "Torta", "Asso", "Moneta d'oro", "Paperella", "Bicerin", "Mascotte Smashy", "Conchiglia", "Portachiavi", "Smashy"] },
    'mole': { image: 'mole_interno.png', targets: ["Take a bite", "Cartolina", "Piuma", "Bandiera", "Salvadanaio", "Aereoplanino", "Binocolo", "Pop corn", "Robot", "Cappello", "Lucchetto", "Treno", "Oscar"] }
};

// --- LOGIN & CUORI ---
function createHearts() {
    const container = document.getElementById('login-screen');
    setInterval(() => {
        if (document.getElementById('login-screen').classList.contains('hidden')) return;
        const heart = document.createElement('div');
        heart.className = 'heart'; heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = Math.random() * 40 + 20 + 'px';
        heart.style.animationDuration = Math.random() * 3 + 4 + 's';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 7000);
    }, 400);
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

// --- CAMERA & ZOOM ---
function initCamera(resetZoom = false) {
    if (!activeContainer) return;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;
    let minScale = Math.max(screenW / contW, screenH / contH);
    if (resetZoom) {
        scale = minScale;
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
    scale = Math.min(Math.max(scale, minScale), 5);
    if (mapX > 0) mapX = 0;
    if (mapX < screenW - contW * scale) mapX = screenW - contW * scale;
    if (mapY > 0) mapY = 0;
    if (mapY < screenH - contH * scale) mapY = screenH - contH * scale;
    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${scale})`;
}

window.addEventListener('wheel', (e) => {
    if (!activeContainer) return;
    e.preventDefault();
    const zoomSpeed = 0.12;
    const oldScale = scale;
    let newScale = e.deltaY < 0 ? scale * (1 + zoomSpeed) : scale / (1 + zoomSpeed);
    const screenW = window.innerWidth, screenH = window.innerHeight;
    let minScale = Math.max(screenW / activeContainer.offsetWidth, screenH / activeContainer.offsetHeight);
    newScale = Math.min(Math.max(newScale, minScale), 5);
    if (newScale !== oldScale) {
        const mouseX = e.clientX, mouseY = e.clientY;
        const ratio = newScale / oldScale;
        mapX = mouseX - (mouseX - mapX) * ratio;
        mapY = mouseY - (mouseY - mapY) * ratio;
        scale = newScale;
        applyTransform();
    }
}, { passive: false });

// --- GESTIONE MOVIMENTO ---
window.addEventListener('mousedown', (e) => {
    if (!activeContainer || e.button !== 0) return;
    isDragging = true;
    hasMoved = false; 
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeContainer) return;
    if (Math.abs(e.clientX - (startX + mapX)) > 5 || Math.abs(e.clientY - (startY + mapY)) > 5) {
        hasMoved = true;
    }
    mapX = e.clientX - startX;
    mapY = e.clientY - startY;
    applyTransform();
});

window.addEventListener('mouseup', () => { isDragging = false; });

// --- LIVELLI ---
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
        slot.innerHTML = `<img src="assets/${id}.png" onerror="this.src='https://via.placeholder.com/50?text=?'"><span>${name}</span>`;
        tray.appendChild(slot);
    });
}

// --- DEBUG TOOL CORRETTO ---
function setupDebug(targets) {
    let panel = document.getElementById('debug-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'debug-panel';
        document.body.appendChild(panel);
    }
    panel.innerHTML = '<b style="color:white">DEBUG: Scegli oggetto</b><hr>';
    targets.forEach(name => {
        const dObj = document.createElement('div');
        dObj.className = 'debug-obj-item';
        dObj.innerText = "• " + name;
        dObj.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.debug-obj-item').forEach(el => el.classList.remove('selected'));
            dObj.classList.add('selected');
            currentObjectToPlace = name; 
        };
        panel.appendChild(dObj);
    });
}

// Click sulla scena per salvare
document.getElementById('level-image').addEventListener('click', function(e) {
    if (hasMoved || !currentObjectToPlace) return;

    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const topPct = ((y / this.offsetHeight) * 100).toFixed(2);
    const leftPct = ((x / this.offsetWidth) * 100).toFixed(2);

    // Stampa il codice pronto da copiare
    console.log(`{ id: '${currentObjectToPlace.toLowerCase().replace(/ /g, '_')}', name: '${currentObjectToPlace}', top: '${topPct}%', left: '${leftPct}%' },`);
    
    // Mostra un marker visivo
    const marker = document.createElement('div');
    marker.className = 'hotspot-debug';
    marker.style.top = topPct + "%"; marker.style.left = leftPct + "%";
    marker.style.width = "20px"; marker.style.height = "20px";
    marker.style.background = "lime";
    marker.style.position = "absolute";
    marker.style.transform = "translate(-50%, -50%)";
    marker.style.borderRadius = "50%";
    marker.style.pointerEvents = "none";
    document.getElementById('interactive-objects').appendChild(marker);
    
    // RESET: devi selezionarne un altro dal pannello
    currentObjectToPlace = null;
    document.querySelectorAll('.debug-obj-item').forEach(el => el.classList.remove('selected'));
});

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    const panel = document.getElementById('debug-panel');
    if(panel) panel.remove(); // Rimuovi debug quando esci
    activeContainer = document.querySelector('#map-screen .map-container');
    initCamera(true);
}
