let isDragging = false;
let hasMoved = false; // Nuova variabile per distinguere click da drag
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

// --- CAMERA ---
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
    const zoomSpeed = 0.1;
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

// --- GESTIONE DRAG VS CLICK ---
window.addEventListener('mousedown', (e) => {
    if (!activeContainer || e.button !== 0) return;
    isDragging = true;
    hasMoved = false; // Resettiamo il movimento
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeContainer) return;
    // Se muoviamo il mouse di più di 5 pixel, consideralo un trascinamento
    if (Math.abs(e.clientX - (startX + mapX)) > 5 || Math.abs(e.clientY - (startY + mapY)) > 5) {
        hasMoved = true;
    }
    mapX = e.clientX - startX;
    mapY = e.clientY - startY;
    applyTransform();
});

window.addEventListener('mouseup', () => {
    setTimeout(() => { isDragging = false; }, 50); // Piccolo delay per non triggerare click
});

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

// --- DEBUG TOOL MIGLIORATO ---
function setupDebug(targets) {
    let panel = document.getElementById('debug-panel') || document.createElement('div');
    panel.id = 'debug-panel';
    document.body.appendChild(panel);
    panel.innerHTML = '<b>DEBUG MODE</b><br><small>Seleziona un nome per attivare il click</small><hr>';
    targets.forEach(name => {
        const dObj = document.createElement('div');
        dObj.className = 'debug-obj-item';
        dObj.style.cursor = "pointer";
        dObj.innerText = "• " + name;
        dObj.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.debug-obj-item').forEach(el => el.style.color = 'white');
            dObj.style.color = '#0f0';
            currentObjectToPlace = name; // Attiva il puntatore per questo oggetto
        };
        panel.appendChild(dObj);
    });
}

// Click sulla scena per salvare
document.getElementById('level-image').addEventListener('click', function(e) {
    // SE sto trascinando O NON ho selezionato un oggetto dalla lista, NON FARE NULLA
    if (hasMoved || !currentObjectToPlace) return;

    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const topPct = ((y / this.offsetHeight) * 100).toFixed(2);
    const leftPct = ((x / this.offsetWidth) * 100).toFixed(2);

    console.log(`{ id: '${currentObjectToPlace.toLowerCase().replace(/ /g, '_')}', name: '${currentObjectToPlace}', top: '${topPct}%', left: '${leftPct}%' },`);
    
    const marker = document.createElement('div');
    marker.className = 'hotspot-debug';
    marker.style.top = topPct + "%"; marker.style.left = leftPct + "%";
    marker.style.width = "30px"; marker.style.height = "30px";
    marker.style.transform = "translate(-50%, -50%)"; // Centra il marker nel punto esatto
    document.getElementById('interactive-objects').appendChild(marker);
    
    alert(`Salvato: ${currentObjectToPlace}`);

    // RESET: Dopo il salvataggio, devi cliccare un altro oggetto dalla lista per salvare ancora
    currentObjectToPlace = null;
    document.querySelectorAll('.debug-obj-item').forEach(el => el.style.color = 'white');
});

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    activeContainer = document.querySelector('#map-screen .map-container');
    initCamera(true);
}
