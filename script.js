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

// --- CUORI GRANDI ---
function createHearts() {
    const container = document.getElementById('login-screen');
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = Math.random() * 40 + 20 + 'px'; // Cuori più grandi
        heart.style.animationDuration = Math.random() * 3 + 5 + 's';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 8000);
    }, 400);
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
        setTimeout(() => initCamera(true), 100);
    } else { alert("Data errata!"); }
}

// --- CAMERA (ZOOM VERSO IL MOUSE) ---
function initCamera(firstTime = false) {
    if (!activeContainer) return;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;

    let minScale = Math.max(screenW / contW, screenH / contH);
    
    // Al primo avvio, impostiamo uno zoom del 50% superiore al minimo per non avere l'immagine piccola
    if (firstTime) scale = minScale * 1.5; 
    else if (scale < minScale) scale = minScale;

    applyTransform();
}

function applyTransform() {
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;

    // Limiti di zoom
    let minScale = Math.max(screenW / contW, screenH / contH);
    if (scale < minScale) scale = minScale;
    if (scale > 5) scale = 5;

    // Limiti di movimento
    if (mapX > 0) mapX = 0;
    if (mapX < screenW - contW * scale) mapX = screenW - contW * scale;
    if (mapY > 0) mapY = 0;
    if (mapY < screenH - contH * scale) mapY = screenH - contH * scale;

    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${scale})`;
}

// ZOOM SUL PUNTATORE
window.addEventListener('wheel', (e) => {
    if (!activeContainer) return;
    e.preventDefault();

    const zoomSpeed = 0.1;
    const oldScale = scale;

    // Calcola posizione mouse rispetto al contenitore
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (e.deltaY < 0) scale *= (1 + zoomSpeed);
    else scale /= (1 + zoomSpeed);

    // Correzione posizione per zoomare sul mouse
    const ratio = scale / oldScale;
    mapX = mouseX - (mouseX - mapX) * ratio;
    mapY = mouseY - (mouseY - mapY) * ratio;

    applyTransform();
}, { passive: false });

// DRAG (SENZA RIMANERE APPIZZATO)
function handleMouseDown(e) {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
}

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeContainer) return;
    mapX = e.clientX - startX;
    mapY = e.clientY - startY;
    applyTransform();
});

window.addEventListener('mouseup', () => { isDragging = false; });

document.getElementById('map-screen').addEventListener('mousedown', handleMouseDown);
document.getElementById('level-screen').addEventListener('mousedown', handleMouseDown);

// --- LIVELLI & DEBUG ---
function openLevel(placeName) {
    const data = levelsData[placeName];
    document.getElementById('level-image').src = data.image;
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    activeContainer = document.getElementById('level-drag-container');
    
    setTimeout(() => {
        initCamera(true); // Parte già un po' zoomato
        setupObjects(data.targets);
        setupDebug(data.targets);
    }, 150);
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
    let panel = document.getElementById('debug-panel') || document.createElement('div');
    panel.id = 'debug-panel';
    document.body.appendChild(panel);
    panel.innerHTML = '<b>DEBUG MODE</b><br><small>1. Seleziona oggetto<br>2. Clicca sulla mappa</small><hr>';
    targets.forEach(name => {
        const dObj = document.createElement('div');
        dObj.style.cursor = "pointer";
        dObj.style.padding = "2px";
        dObj.innerText = "• " + name;
        dObj.onclick = () => {
            document.querySelectorAll('#debug-panel div').forEach(el => el.style.color = 'white');
            dObj.style.color = '#0f0';
            currentObjectToPlace = name;
        };
        panel.appendChild(dObj);
    });
}

// Click per salvare posizione (Debug)
document.getElementById('level-image').onclick = function(e) {
    if (!currentObjectToPlace) return;
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const topPct = ((y / this.offsetHeight) * 100).toFixed(2);
    const leftPct = ((x / this.offsetWidth) * 100).toFixed(2);

    console.log(`{ id: '${currentObjectToPlace.toLowerCase().replace(/ /g, '_')}', name: '${currentObjectToPlace}', top: '${topPct}%', left: '${leftPct}%' },`);
    alert(`Posizione per "${currentObjectToPlace}" salvata in console!`);
};

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    activeContainer = document.querySelector('#map-screen .map-container');
    initCamera(true);
}
